import * as fs from 'fs';

const removeFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error);
  }
};

export default removeFile;
