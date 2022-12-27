import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { createHmac } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { MIME_TYPES } from './constants';
import { FileSave, FilesUploaded, FilesUploads, HasFiles } from './types';

/* Функция проверки - соответствует ли тип объекта: Express.Multer.File */
const isMulterFile = (
  fileObj: Express.Multer.File | Express.Multer.File[],
): boolean => {
  const filesObjects = Array.isArray(fileObj) ? fileObj : [fileObj];
  let result = true;

  for (fileObj of filesObjects) {
    result =
      result &&
      fileObj.hasOwnProperty('fieldname') &&
      fileObj.hasOwnProperty('mimetype') &&
      fileObj.hasOwnProperty('size') &&
      fileObj.hasOwnProperty('buffer');
  }

  return result;
};

/* Функция использования валидатора, если он есть */
const smartUseValidator = (
  fileObj: Express.Multer.File | Express.Multer.File[],
  validator?: FilesUploads.Params.Validator.Func,
) => {
  const validated = validator
    ? validator(fileObj)
    : { state: true, message: 'Validator has not set' };

  if (!validated.state) {
    throw new RpcException({
      code: 400,
      message: validated.message,
    });
  }
};

/* Функция создания хэша для нового имени файла */
const createHashFileName = () =>
  createHmac('sha256', 'uploadFileNameSecret')
    .update(new Date().toISOString())
    .digest('hex');

/* 
    Метод сохранения файла
    Если путь для сохранения не найден, то будут созданы (рекурсивно) новые директории
    Также здесь проводится проверка типа файла и прочая валидация (если есть)
*/
const smartFileSave: FileSave.Func = (
  field: string,
  uploadParams: FilesUploads.Params,
  fileObj: Express.Multer.File | Express.Multer.File[],
  callback: FileSave.Callback.Func,
) => {
  const filesObjects = Array.isArray(fileObj) ? fileObj : [fileObj];

  for (fileObj of filesObjects.slice(0, uploadParams.fields[field].maxCount)) {
    for (const mimeType of uploadParams.mimeTypes) {
      const match = fileObj.mimetype.match(mimeType);

      if (!match) continue;

      const savedFileName = createHashFileName();
      const savedFilePath = `${savedFileName}.${mimeType}`;

      const dest = uploadParams.fields[field].dest ?? uploadParams.dest;
      const preparedDest = ['\\', '/'].includes(dest[dest.length - 1])
        ? dest
        : dest + '/';

      if (!existsSync(preparedDest)) {
        mkdirSync(preparedDest, { recursive: true });
      }

      writeFileSync(
        `${preparedDest}${savedFilePath}`,
        Buffer.from(fileObj.buffer),
      );

      callback(field, savedFileName);
    }
  }
};

/* 
    Декоратор для параметров
    Используется в контексте параметра микросервисного контроллера NestJS
    Ожидается получение DTO имеющего внутри поля, типа: Express.Multer.File 
*/
const FileUpload = createParamDecorator(
  (data: FilesUploads.Params, ctx: ExecutionContext) => {
    const rpcReq: HasFiles = ctx.switchToRpc().getData();
    const updatedDto: FilesUploaded = { ...rpcReq };

    for (const field in rpcReq) {
      if (!data.fields[field]) continue;
      if (!isMulterFile(rpcReq[field])) continue;

      smartUseValidator(rpcReq[field], data.validator);

      updatedDto[field] = [];

      smartFileSave(
        field,
        data,
        rpcReq[field],
        (field: string, savedFileName: string) => {
          updatedDto[field].push(savedFileName);
        },
      );
    }

    return updatedDto;
  },
);

export { MIME_TYPES, FileUpload };
