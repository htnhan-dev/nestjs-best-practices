import * as path from 'path';

import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';

import { EXT_IMAGE } from '../constants';
import removeFile from '../utils/remove-file.util';
import sharp from 'sharp';

@Injectable()
export class OptimizedMediaInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const files = (request.files as Express.Multer.File[]) || [];
    const file = request.file as Express.Multer.File | undefined;

    const promises: Promise<string>[] = [];

    if (file) {
      promises.push(this.optimizeMedia(file));
    }

    if (files.length > 0) {
      promises.push(...files.map((f) => this.optimizeMedia(f)));
    }

    if (promises.length > 0) {
      return from(Promise.all(promises)).pipe(
        switchMap((optimizedPaths) => {
          if (file) {
            const relativePath = optimizedPaths[0]
              .replace(process.cwd(), '')
              .replace(/\\/g, '/');
            const newFilename =
              path.basename(relativePath, path.extname(relativePath)) + '.webp';
            request.file = {
              ...file,
              path: relativePath,
              filename: newFilename,
            };
          }

          if (files.length > 0) {
            request.files = optimizedPaths.map((p, index) => {
              const relativePath = p
                .replace(process.cwd(), '')
                .replace(/\\/g, '/');
              const newFilename =
                path.basename(relativePath, path.extname(relativePath)) +
                '.webp';
              return {
                ...files[index],
                path: relativePath,
                filename: newFilename,
              };
            });
          }
          return next.handle();
        }),
      );
    }

    return next.handle();
  }

  private optimizeMedia(file: Express.Multer.File): Promise<string> {
    const filePath = file.path;
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    const extension = path.extname(filePath).toLowerCase();

    if (EXT_IMAGE.includes(extension) || file.mimetype.startsWith('image/')) {
      return this.optimizeImage(filePath, fileDir, fileName);
    }

    // Video hoặc file khác giữ nguyên, có thể thêm ffmpeg optimize sau
    return Promise.resolve(filePath);
  }

  private optimizeImage(
    filePath: string,
    fileDir: string,
    fileName: string,
  ): Promise<string> {
    const optimizedFileName = `${fileName}.webp`;
    const optimizedFilePath = path.join(fileDir, optimizedFileName);

    return sharp(filePath)
      .resize({
        width: 1200, // max width 1200px
        withoutEnlargement: true,
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 80 }) // medium
      .toFile(optimizedFilePath)
      .then(() => {
        removeFile(filePath); // xóa file gốc
        return optimizedFilePath;
      })
      .catch((err) => {
        console.error('Sharp error:', err);
        throw new BadRequestException('Failed to optimize image');
      });
  }
}
