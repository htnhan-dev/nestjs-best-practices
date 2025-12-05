import * as fs from 'fs';

import { extname, join } from 'path';

import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB

export const ensureDir = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

export const multerConfig = (folderPath: string) => {
  const absPath = join(process.cwd(), folderPath);
  ensureDir(absPath);

  return {
    storage: diskStorage({
      destination: (_, __, cb) => cb(null, absPath),
      filename: (_, file, cb) => {
        const random = Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('');

        cb(null, `${random}${extname(file.originalname)}`);
      },
    }),

    limits: {
      fileSize: MAX_IMAGE_SIZE,
    },

    fileFilter: (_, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
        return;
      }

      cb(new BadRequestException('Only images are allowed'), false);
    },
  };
};
