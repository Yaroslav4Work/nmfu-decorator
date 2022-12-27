/// <reference types="multer" />
export declare namespace FilesUploads {
    type Params = {
        dest: string;
        fields: FilesUploads.Params.Fields;
        validator?: FilesUploads.Params.Validator.Func;
        mimeTypes: string[];
    };
    namespace Params {
        type Fields = {
            [fileField: string]: {
                dest?: string;
                maxCount?: number;
            };
        };
        namespace Validator {
            type Func = (data: Express.Multer.File | Express.Multer.File[]) => FilesUploads.Params.Validator.Res;
            type Res = {
                state: boolean;
                message: string;
            };
        }
    }
}
export declare namespace FileSave {
    type Func = (field: string, uploadParams: FilesUploads.Params, fileObj: Express.Multer.File | Express.Multer.File[], callback: FileSave.Callback.Func) => void;
    namespace Callback {
        type Func = (field: string, savedFilePath: string) => void;
    }
}
export type HasFiles = {
    [fileField: string]: Express.Multer.File | Express.Multer.File[];
};
export type FilesUploaded = {
    [fileField: string]: string | string[];
};
//# sourceMappingURL=types.d.ts.map