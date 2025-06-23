/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';

import { fileFilter, fileNamer } from './helpers';
const zipFileFilter = (req, file, callback) => {
  if (!file) {
    return callback(new Error('Archivo vacío'), false);
  }
  if (
    file.mimetype === 'application/zip' ||
    file.mimetype === 'application/x-zip-compressed'
  ) {
    callback(null, true);
  } else {
    callback(new Error('Solo se permiten archivos .zip'), false);
  }
};

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('unzip')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: zipFileFilter, // Usamos el nuevo filtro
      // No usamos diskStorage para manejar el archivo en memoria
    }),
  )
  unzipProducts(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.unzipAndSaveProducts(file);
  }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 }
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    // const secureUrl = `${ file.filename }`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${
      file.filename
    }`;

    return { secureUrl, fileName: file.filename };
  }
}
