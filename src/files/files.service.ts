// src/files/files.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// --- ESTA ES LA LÍNEA CORRECTA Y DEFINITIVA ---
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdmZip = require('adm-zip');

@Injectable()
export class FilesService {
  private readonly logger = new Logger('FilesService');

  getStaticProductimage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);
    if (!existsSync(path))
      throw new BadRequestException(
        `Not product found with image ${imageName}`,
      );
    return path;
  }

  async unzipAndSaveProducts(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Asegúrate de que el archivo no esté vacío.',
      );
    }

    const destinationPath = join(__dirname, '../../static/products');

    if (!existsSync(destinationPath)) {
      mkdirSync(destinationPath, { recursive: true });
    }

    try {
      const zip = new AdmZip(file.buffer);
      zip.extractAllTo(destinationPath, /*overwrite*/ true);
    } catch (error) {
      this.logger.error('Failed to unzip file', error.stack);
      throw new InternalServerErrorException(
        'Error al descomprimir el archivo .zip',
      );
    }

    return { message: 'Archivo .zip descomprimido y guardado correctamente.' };
  }
}
