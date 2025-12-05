import type { Image } from '@/shared/schemas';

export const multerFileToMedia = (
  file: Express.Multer.File,
  alt?: string,
  position = 0,
): Image => {
  return {
    url: file.path,
    alt: alt || file.originalname,
    filename: file.filename,
    position,
  };
};
