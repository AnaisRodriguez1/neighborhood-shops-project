export const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File, 
    callback: Function) => {
    // Verifica si el archivo es una imagen
    if (!file) return callback(new Error('No se ha subido ningún archivo'), false);
    
    const fileExtension = file.mimetype.split('/')[1];
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif'];

    if( allowedExtensions.includes(fileExtension)) {
        return callback(null,true);
    }
    
    // Si pasa todas las verificaciones, acepta el archivo
    callback(null, false);
}