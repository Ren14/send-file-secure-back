/**
 * CryptographyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const NodeRSA = require('node-rsa');
const fs = require('fs');
const crypto = require('crypto');

module.exports = {

    signFile: async function (req, res) {
        if(!req.body.fileName) return res.badRequest( 'Se esperaba el parametro fileName' );
        if(!req.body.privateKey) return res.badRequest( 'Se esperaba el parametro privateKey' );

        // TODO: Revisar la recepción de la pK desde el front
        //const privateKey = req.body.privateKey;
        const privateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA1kEcxt+gJ5KZ3YgeX+C+j14u3jsaxuPMWlf4XvsHnpYsd18o\nyLhUZx+LSZCe6adnf9rHuk5KII55oor/IiQYXizqkaOm4Yv3QnnU+lyk/WcebBob\nxFKVpjXg1fbfSSOJ4g59cykTzcwZHXFbi561HKibpKZUPUudd4tvIoCqtrLsRLq7\niyX1eNBnFDkjA1VSIMdJUuunNr9uBLzCqUPzteJu+klwikEN/PFeW9rDC5bZpgSS\nHVkWAs6XyCC8S0kPIq3uNiCsyKygEVttSCoaUgp7jI0/nV2GdxFaUOIfBUUWBTbU\n7UQlya4a56MOc9lkrCn5k7vU40CbFYc6mb4w8wIDAQABAoIBAANZARoaZGY55C2R\n8ueMm22iCxlt0v1IkejXdwoE4hmYPxmeYwS/3JG/7G051UHRW8yjnntKvd3EXCIu\nCc5+weK20PN1myXrCfH/9VP0Hp/W/KKzxbtLjwsJzHmLYfHCnGTr1Qn3mlec2Mec\n/dEwqaPI/qWT870BcXRsuU/Qston6jTb6weKzO1FOv5QPJ9Cp7dnIFclCvzISi5i\nY9DCwT/vGYrCr6R0sW/Rgge6zyq8Ju89zTuA7zFakhvpVF7YW5L1hMMAFaEI6/zr\ndgkEFcd/3J85HE6mOQck6IJjnDbVbLYPUvEYfVBCDbpcPJLH2OAI0UgPcFI8oi6v\nHmy0gAECgYEA9yLXwSbL2TgpzqGy3KDLjZx76nzyD2Jt7MkVSZGDezvQnBnMSSgi\nk+t4xp3rTJH3s/uFFo+zLsA/RGNiuHJ6yLbGF1MfYqO+gxgHeIoITuoHM3YrJSy5\npjXvzMHtsZvGreo8nGslAZIr491a+dfAlczHDHXur3gOTKOL4Gj0AbECgYEA3fBb\nAYbk/jwch4+3ioK4BgCVb0ShD19/w5CC7E4b9837dGlujZkJAPC8IW65vRbKutFQ\nXTobOrAedcXh8c2fq5eh6MHLId1K24N3N5+aGIKaQFDzOIAB9Omlo7vsxs0VhTv3\n+GdDigeqt+/KWNr95Ob2mOWfDP/1M52oEzwPAeMCgYAXdIsdnd0DBL2TCu262tf2\n3L82Bh3DMAhWzM7kaJcd/xNRfXFSECkX+OVBlINchQ4JWvnKpmDPMxfOGdCoyNS2\ncAJk/FKiPgA62PD8k70uIDAGxlRZ9uC30a6stEsm7C3zG6QdBF5Cw+i+e6fCxqNU\nlFbf6+F3beGNjIgeCFgAQQKBgGLoljZE/tLKyVAk3YBOJ2MNaYuQA1NNlSv7wE09\ntjsmwlSsFAfo1tljcARaS06Y1LqTRAR4O+BY0wpbqQlRQUKArjiD/VpXO+A+Y6gX\nad5YfhQBv5NDgRu78QTaYHhst5WMF0POCYx/RDb7F6un1RTpVaboVoy9mXJqZZhE\n4M9PAoGBAL9CRxQ4JoHdjJjkUZ2QWd+3YqrY/xXgSVvk3cONMEQTb4Tv1s6ReTbr\nQUQWL0Ge6fO6HnqgEXAE3BeRbG/JsWoF/scUfn8YxWqXi2IGf7m2W9OTLVNtigqx\n6reQai7v6dz5DD3pJuzbaZ8Cl6vm5kErVxIf1RWO8gUjioZPnEF7\n-----END RSA PRIVATE KEY-----';

        try {
            // Obtenemos el PATH del archivo desencriptado
            const filePath = require('path').resolve(sails.config.appPath, sails.config.custom.pathDecryptFiles) + "/" + req.body.fileName;

            //Leemos el archivo desde su ubicación física 
            const fileToSign = fs.readFileSync(filePath, 'base64');

            if(!fileToSign) return res.badRequest( 'Error al leer el archivo del directorio ' + filePath );
            
            // Creamos el objeto que contendrá los metodos de NodeRSA
            const key = new NodeRSA(privateKey);	

            if(key.isEmpty()) return res.badRequest( 'La clave está vacía o es incorrecta. Intente nuevamente.' );        
            if(!key.isPrivate()) return res.badRequest( 'La clave ingresada no es privada. Intente nuevamente.' );

            // Firmamos el archivo con la clave privada
            const signFile = key.sign(fileToSign, 'base64');
            
            return res.status(200).json( {
                status : 'success',											
                signFile: signFile,					
            });
        } catch (error) {
            return res.badRequest(error.toString());  
        }
        
    },

    verifySignFile: async function (req, res) {

        if(!req.body.fileName) return res.badRequest( 'Se esperaba el parametro fileName' );
        if(!req.body.publicKey) return res.badRequest( 'Se esperaba el parametro publicKey' );
        if(!req.body.signature) return res.badRequest( 'Se esperaba el parametro signature' );

        //const publicKey = req.body.publicKey;
        // TODO: Resolver el envio de la public Key desde el front-end
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1kEcxt+gJ5KZ3YgeX+C+\nj14u3jsaxuPMWlf4XvsHnpYsd18oyLhUZx+LSZCe6adnf9rHuk5KII55oor/IiQY\nXizqkaOm4Yv3QnnU+lyk/WcebBobxFKVpjXg1fbfSSOJ4g59cykTzcwZHXFbi561\nHKibpKZUPUudd4tvIoCqtrLsRLq7iyX1eNBnFDkjA1VSIMdJUuunNr9uBLzCqUPz\nteJu+klwikEN/PFeW9rDC5bZpgSSHVkWAs6XyCC8S0kPIq3uNiCsyKygEVttSCoa\nUgp7jI0/nV2GdxFaUOIfBUUWBTbU7UQlya4a56MOc9lkrCn5k7vU40CbFYc6mb4w\n8wIDAQAB\n-----END PUBLIC KEY-----';
		const signature = req.body.signature;
        const filePath = require('path').resolve(sails.config.appPath, sails.config.custom.pathDecryptFiles) + "/" + req.body.fileName; 
        const fileToVerifySign = fs.readFileSync(filePath, 'base64');
        if(!fileToVerifySign) return res.badRequest( 'No pudimos verificar la firma. No encontramos el archivo en el directorio' + filePath );
        		
		try{

			// Creamos el objeto que contendrá los metodos de NodeRSA a partir de las claves
			const key = new NodeRSA(publicKey);
			if(key.isEmpty()) return res.badRequest( 'La clave está vacía o es incorrecta. Intente nuevamente.' );
			if(key.isPrivate()) return res.badRequest( 'La clave ingresada es privada. Se requiere una clave pública. Intente nuevamente.');			

			// Verificamos la firma del archivo con El archivo original, la signatura y la clave pública de la persona que lo firmó con su privateKey
			const verifySignFile = key.verify(fileToVerifySign, signature, 'utf8', 'base64');

			return res.status(200).json( {
				status : 'success',
				verifySignFile: verifySignFile,
			});
		} catch (error){				
			return res.badRequest( error.toString() );
		}
    },

    encryptFile: async function (req, res) {
        if(!req.body.fileName) return res.badRequest( 'Se esperaba el parametro fileName' );
        if(!req.body.publicKey) return res.badRequest( 'Se esperaba el parametro publicKey' );

        const fileName = req.body.fileName;
        // TODO: Resolver el envio de la public Key desde el front-end
        const publicKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1kEcxt+gJ5KZ3YgeX+C+\nj14u3jsaxuPMWlf4XvsHnpYsd18oyLhUZx+LSZCe6adnf9rHuk5KII55oor/IiQY\nXizqkaOm4Yv3QnnU+lyk/WcebBobxFKVpjXg1fbfSSOJ4g59cykTzcwZHXFbi561\nHKibpKZUPUudd4tvIoCqtrLsRLq7iyX1eNBnFDkjA1VSIMdJUuunNr9uBLzCqUPz\nteJu+klwikEN/PFeW9rDC5bZpgSSHVkWAs6XyCC8S0kPIq3uNiCsyKygEVttSCoa\nUgp7jI0/nV2GdxFaUOIfBUUWBTbU7UQlya4a56MOc9lkrCn5k7vU40CbFYc6mb4w\n8wIDAQAB\n-----END PUBLIC KEY-----';
        const decryptPath = require('path').resolve(sails.config.appPath, sails.config.custom.pathDecryptFiles) + "/" + fileName;
        const encryptPath = require('path').resolve(sails.config.appPath, sails.config.custom.pathEncryptFiles) + "/" + fileName;

        try {
            //Leemos el archivo desde su ubicación física 
            const fileToEncrypt = fs.readFileSync(decryptPath, 'base64');

            if(!fileToEncrypt) return res.badRequest( 'Error al leer el archivo del directorio ' + decryptPath );

            // Creamos el objeto que contendrá los metodos de NodeRSA a partir de la clave pública
            const key = new NodeRSA(publicKey);	

            if(key.isEmpty()) return res.badRequest( 'La clave está vacía o es incorrecta.') ;
            if(key.isPrivate()) return res.badRequest( 'La clave ingresada es privada, debe enviar una clave pública' );
            
            // Encriptamos el archivo con la clave pública
            const encryptedFile = key.encrypt(fileToEncrypt, 'base64');
            
            // Lo almacenamos en el directorio donde se almacenan los archivos encriptados
            fs.openSync(encryptPath, 'w');
            fs.writeFileSync(encryptPath, encryptedFile, 'utf8');

            return res.status(200).json( {
                status : 'success',											
                encryptedFile: fileName,
                filePath: encryptPath,
            });    
        } catch (error) {                        
            return res.badRequest(error.toString());  
        }
        
        
    },

    decryptFile: async function (req, res) {
        if(!req.body.fileName) return res.badRequest( 'Se esperaba el parametro fileName' );
        if(!req.body.privateKey) return res.badRequest( 'Se esperaba el parametro privateKey' );

        const fileName = req.body.fileName;
        // TODO: Revisar la recepción de la pK desde el front
        const privateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA1kEcxt+gJ5KZ3YgeX+C+j14u3jsaxuPMWlf4XvsHnpYsd18o\nyLhUZx+LSZCe6adnf9rHuk5KII55oor/IiQYXizqkaOm4Yv3QnnU+lyk/WcebBob\nxFKVpjXg1fbfSSOJ4g59cykTzcwZHXFbi561HKibpKZUPUudd4tvIoCqtrLsRLq7\niyX1eNBnFDkjA1VSIMdJUuunNr9uBLzCqUPzteJu+klwikEN/PFeW9rDC5bZpgSS\nHVkWAs6XyCC8S0kPIq3uNiCsyKygEVttSCoaUgp7jI0/nV2GdxFaUOIfBUUWBTbU\n7UQlya4a56MOc9lkrCn5k7vU40CbFYc6mb4w8wIDAQABAoIBAANZARoaZGY55C2R\n8ueMm22iCxlt0v1IkejXdwoE4hmYPxmeYwS/3JG/7G051UHRW8yjnntKvd3EXCIu\nCc5+weK20PN1myXrCfH/9VP0Hp/W/KKzxbtLjwsJzHmLYfHCnGTr1Qn3mlec2Mec\n/dEwqaPI/qWT870BcXRsuU/Qston6jTb6weKzO1FOv5QPJ9Cp7dnIFclCvzISi5i\nY9DCwT/vGYrCr6R0sW/Rgge6zyq8Ju89zTuA7zFakhvpVF7YW5L1hMMAFaEI6/zr\ndgkEFcd/3J85HE6mOQck6IJjnDbVbLYPUvEYfVBCDbpcPJLH2OAI0UgPcFI8oi6v\nHmy0gAECgYEA9yLXwSbL2TgpzqGy3KDLjZx76nzyD2Jt7MkVSZGDezvQnBnMSSgi\nk+t4xp3rTJH3s/uFFo+zLsA/RGNiuHJ6yLbGF1MfYqO+gxgHeIoITuoHM3YrJSy5\npjXvzMHtsZvGreo8nGslAZIr491a+dfAlczHDHXur3gOTKOL4Gj0AbECgYEA3fBb\nAYbk/jwch4+3ioK4BgCVb0ShD19/w5CC7E4b9837dGlujZkJAPC8IW65vRbKutFQ\nXTobOrAedcXh8c2fq5eh6MHLId1K24N3N5+aGIKaQFDzOIAB9Omlo7vsxs0VhTv3\n+GdDigeqt+/KWNr95Ob2mOWfDP/1M52oEzwPAeMCgYAXdIsdnd0DBL2TCu262tf2\n3L82Bh3DMAhWzM7kaJcd/xNRfXFSECkX+OVBlINchQ4JWvnKpmDPMxfOGdCoyNS2\ncAJk/FKiPgA62PD8k70uIDAGxlRZ9uC30a6stEsm7C3zG6QdBF5Cw+i+e6fCxqNU\nlFbf6+F3beGNjIgeCFgAQQKBgGLoljZE/tLKyVAk3YBOJ2MNaYuQA1NNlSv7wE09\ntjsmwlSsFAfo1tljcARaS06Y1LqTRAR4O+BY0wpbqQlRQUKArjiD/VpXO+A+Y6gX\nad5YfhQBv5NDgRu78QTaYHhst5WMF0POCYx/RDb7F6un1RTpVaboVoy9mXJqZZhE\n4M9PAoGBAL9CRxQ4JoHdjJjkUZ2QWd+3YqrY/xXgSVvk3cONMEQTb4Tv1s6ReTbr\nQUQWL0Ge6fO6HnqgEXAE3BeRbG/JsWoF/scUfn8YxWqXi2IGf7m2W9OTLVNtigqx\n6reQai7v6dz5DD3pJuzbaZ8Cl6vm5kErVxIf1RWO8gUjioZPnEF7\n-----END RSA PRIVATE KEY-----';

        try {
            // Creamos el objeto que contendrá los metodos de NodeRSA  	
            const objectPrivateKey = new NodeRSA(privateKey);            
            const encryptPath = require('path').resolve(sails.config.appPath, sails.config.custom.pathEncryptFiles) + "/" + fileName;
            // Leemos el archivo que desaemos desencriptar (Ej. una receta o un test de coronavirus)
            const file = fs.readFileSync(encryptPath, 'utf8');
            // Desencriptamos a partir de la clave privada		  	
            const decrypted = objectPrivateKey.decrypt(file, 'utf8');
            // Lo almacenamos en el directorio temporal de archivos desencriptados
            const decryptPath = require('path').resolve(sails.config.appPath, sails.config.custom.pathDecryptFiles) + "/" + fileName;
            fs.openSync(decryptPath, 'w');
            fs.writeFileSync(decryptPath, decrypted, 'base64');
            
            return res.status(200).json( {
                status : 'success',					
                fileName : fileName,
                filePath : decryptPath
            });    
        } catch (error) {
            return res.badRequest(error.toString());
        }
        
    },

    generateKeys: async function(req, res){

        const key = new NodeRSA({ b : 2048});
        const publicKey = key.exportKey('public');
        const privateKey = key.exportKey('private');

        const keys = {
            publicKey : publicKey,
            privateKey : privateKey
        }

        return res.status(200).json({
            status: 'success',
            keys : keys
        });
    },

    hashFile: async function (req, res){

        if(!req.body.fileName) return res.badRequest( 'Se esperaba el parametro fileName' );
        const fileName = req.body.fileName;
        const filePath = require('path').resolve(sails.config.appPath, sails.config.custom.pathDecryptFiles) + "/" + fileName; 

        // Ambos metodos son iguales
        /*const hash = crypto.createHash('sha256');
        const input = fs.createReadStream(filePath);
        input.on('readable', () => {
          const data = input.read();
          if (data)
            hash.update(data);
          else {            
            const hashDigest = hash.digest('hex');
            return res.status(200).json({
                hash: hashDigest
            })
          }
        });*/

        
        let file_buffer = fs.readFileSync(filePath);
        let objectCrypto = crypto.createHash('sha256');
        objectCrypto.update(file_buffer);
        const hash = objectCrypto.digest('hex');
        return res.status(200).json({
            hash: hash
        })


        // Fuente: https://gist.github.com/GuillermoPena/9233069
         
    }
};

