import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import AdmZip from 'adm-zip';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);

    if (!existsSync(path))
      throw new BadRequestException(`No product found with image ${imageName}`);

    return path;
  }

  async unzipAndSaveProducts(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Asegúrate de que el archivo no esté vacío.',
      );
    }

    // Ruta de destino dentro del contenedor, que está montada en nuestro Volumen Persistente
    const destinationPath = join(__dirname, '../../static/products');

    // Asegurarse de que el directorio de destino existe
    if (!existsSync(destinationPath)) {
      mkdirSync(destinationPath, { recursive: true });
    }

    try {
      // Usamos el buffer del archivo en memoria para crear el zip
      const zip = new AdmZip(file.buffer);
      // Extraemos todo el contenido en la ruta de destino, sobreescribiendo si existen
      zip.extractAllTo(destinationPath, /*overwrite*/ true);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al descomprimir el archivo .zip',
      );
    }

    return { message: 'Archivo .zip descomprimido y guardado correctamente.' };
  }
}
