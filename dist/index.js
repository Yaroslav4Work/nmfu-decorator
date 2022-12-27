"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUpload = exports.MIME_TYPES = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const constants_1 = require("./constants");
Object.defineProperty(exports, "MIME_TYPES", { enumerable: true, get: function () { return constants_1.MIME_TYPES; } });
/* Функция проверки - соответствует ли тип объекта: Express.Multer.File */
const isMulterFile = (fileObj) => {
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
const smartUseValidator = (fileObj, validator) => {
    const validated = validator
        ? validator(fileObj)
        : { state: true, message: 'Validator has not set' };
    if (!validated.state) {
        throw new microservices_1.RpcException({
            code: 400,
            message: validated.message,
        });
    }
};
/* Функция создания хэша для нового имени файла */
const createHashFileName = () => (0, crypto_1.createHmac)('sha256', 'uploadFileNameSecret')
    .update(new Date().toISOString())
    .digest('hex');
/*
    Метод сохранения файла
    Если путь для сохранения не найден, то будут созданы (рекурсивно) новые директории
    Также здесь проводится проверка типа файла и прочая валидация (если есть)
*/
const smartFileSave = (field, uploadParams, fileObj, callback) => {
    var _a;
    const filesObjects = Array.isArray(fileObj) ? fileObj : [fileObj];
    for (fileObj of filesObjects.slice(0, uploadParams.fields[field].maxCount)) {
        for (const mimeType of uploadParams.mimeTypes) {
            const match = fileObj.mimetype.match(mimeType);
            if (!match)
                continue;
            const savedFileName = createHashFileName();
            const savedFilePath = `${savedFileName}.${mimeType}`;
            const dest = (_a = uploadParams.fields[field].dest) !== null && _a !== void 0 ? _a : uploadParams.dest;
            const preparedDest = ['\\', '/'].includes(dest[dest.length - 1])
                ? dest
                : dest + '/';
            if (!(0, fs_1.existsSync)(preparedDest)) {
                (0, fs_1.mkdirSync)(preparedDest, { recursive: true });
            }
            (0, fs_1.writeFileSync)(`${preparedDest}${savedFilePath}`, Buffer.from(fileObj.buffer));
            callback(field, savedFilePath);
        }
    }
};
/*
    Декоратор для параметров
    Используется в контексте параметра микросервисного контроллера NestJS
    Ожидается получение DTO имеющего внутри поля, типа: Express.Multer.File
*/
const FileUpload = (0, common_1.createParamDecorator)((data, ctx) => {
    const rpcReq = ctx.switchToRpc().getData();
    let updatedFilesDto = {};
    for (const field in rpcReq) {
        if (!data.fields[field])
            continue;
        if (!isMulterFile(rpcReq[field]))
            continue;
        smartUseValidator(rpcReq[field], data.validator);
        smartFileSave(field, data, rpcReq[field], (field, savedFilePath) => {
            updatedFilesDto[field] = updatedFilesDto[field] ? [...updatedFilesDto[field], savedFilePath] : [savedFilePath];
        });
    }
    for (const fileField in updatedFilesDto) {
        if (updatedFilesDto[fileField].length === 1)
            updatedFilesDto[fileField] = updatedFilesDto[fileField][0];
    }
    return Object.assign(Object.assign({}, rpcReq), updatedFilesDto);
});
exports.FileUpload = FileUpload;
//# sourceMappingURL=index.js.map