/**
 * IpfsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ipfsClient = require('ipfs-http-client');
const ipfs = new ipfsClient({ 
    host: sails.config.custom.ipfsHost, 
    port: sails.config.custom.ipfsPort, 
    protocol: sails.config.custom.ipfsProtocol 
});
const fs = require('fs');
const https = require("https");

module.exports = {
  
    /**
     * Permite subir un archivo alojado en el servidor de archivos donde corre la aplicación a IPFS     * 
     * El archivo debe estar almacenado en el directorio de archivos encriptados
     * @param {fileName} req.body.fileName Nombre del archivo encriptado a subir.
     * @param {*} res 
     * @returns 
     */
    uploadEncryptedFile: async function (req, res){   
        if(!req.body.fileName) return res.badRequest( 'Se esperaba el parametro fileName' );
        
 		const path = require('path').resolve(sails.config.appPath, sails.config.custom.pathEncryptFiles) + "/" + req.body.fileName;
		const encryptedFile = fs.readFileSync(path, 'utf8');
		
		let fileToUpload;

		try{
			
			for await (fileToUpload of ipfs.add(encryptedFile)) {
			    return res.status(200).json({
                    status: 'success',
                    msg: "El archivo fue subido correctamente",				
					ipfs: fileToUpload,
				});
			}

		} catch (e){
			return res.badRequest(e.toString());
		}
    },

    downloadFile: async function (req, res){
        if(!req.body.fileName) return res.badRequest( 'Se esperaba el parametro fileName' );
        if(!req.body.ipfsPath) return res.badRequest( 'Se esperaba el parametro ipfsPath' );

        const fileName = req.body.fileName;
        const ipfsPath = req.body.ipfsPath;
        
        const downloadFileFromIPFS = require('path').resolve(sails.config.appPath, sails.config.custom.pathEncryptFiles) + "/" + fileName;
        const file = fs.createWriteStream(downloadFileFromIPFS);
		const pathDownloadFileIpfs = sails.config.custom.ipfsGateway + ipfsPath;
		try {
            https.get(pathDownloadFileIpfs, response => { // Si uso el nodo de infura, debo usar el protocolo https. Si utilizo localhost, debo usar http.

                const stream = response.pipe(file);
    
                stream.on("finish", async function() {
                    return res.status(200).json( {
                        status : 'success'
                    });
                });
            });
        } catch (error) {
            return res.badRequest(error.toString());  
        }				
    },


};

