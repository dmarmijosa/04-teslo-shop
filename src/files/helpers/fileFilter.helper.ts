export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, bandera: boolean) => void,
) => {
  if (!file) return callback(new Error('File is empty'), false);
  const fileExtension: string = file.mimetype.split('/')[1];
  const validExtension: string[] = ['jpg', 'jpeg', 'png', 'gif'];
  if (validExtension.includes(fileExtension)) {
    return callback(null, true);
  }
  callback(null, false);
};
