export namespace FilesUploads {
  export type Params = {
    dest: string;
    fields: FilesUploads.Params.Fields;
    validator?: FilesUploads.Params.Validator.Func;
    mimeTypes: string[];
  };

  export namespace Params {
    export type Fields = {
      [fileField: string]: {
        dest?: string;
        maxCount?: number;
      };
    };

    export namespace Validator {
      export type Func = (
        data: Express.Multer.File | Express.Multer.File[],
      ) => FilesUploads.Params.Validator.Res;

      export type Res = {
        state: boolean;
        message: string;
      };
    }
  }
}

export namespace FileSave {
  export type Func = (
    field: string,
    uploadParams: FilesUploads.Params,
    fileObj: Express.Multer.File | Express.Multer.File[],
    callback: FileSave.Callback.Func,
  ) => void;

  export namespace Callback {
    export type Func = (field: string, savedFilePath: string) => void;
  }
}

export type HasFiles = {
  [fileField: string]: Express.Multer.File | Express.Multer.File[];
};

export type FilesUploaded = {
  [fileField: string]: string | string[];
};
