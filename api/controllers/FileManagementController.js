/**
 * FileManagementController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const path = require('path');

module.exports = {
    
    /**
     * Permite subir un archivo al sistema de archivos donde corre la aplicación
     * @param {file} req.body.file Archivo a subir menor a 10 Mb
     * @param {*} res 
     */
    uploadFile: async function(req, res){       
        
        req.file('file').upload({		    
            maxBytes: 10000000,
            dirname: require('path').resolve(sails.config.appPath, sails.config.custom.pathDecryptFiles),
        }, async function whenDone(err, uploadedFiles) {
            
            if (err) {
                return res.serverError(err);
            }
          
            // If no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0){
                return res.badRequest('No file was uploaded');                
            }
            
            const fileName = path.basename(uploadedFiles[0].fd);
            
            return res.status(200).json({
                status: 'success',
                msg: "El archivo fue subido correctamente",
                fileUpload: uploadedFiles,
                fileName: fileName
            });
            
        });    
        
		
    }
};

