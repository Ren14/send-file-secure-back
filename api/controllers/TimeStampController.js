/**
 * TimeStampController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require('axios');

module.exports = {
  
    stamp: async function (req, res) {

        if(!req.body.hashFile) return res.badRequest("Se esperaba el parametro hashFile");
        const hashFile = req.body.hashFile;

        await axios.post(sails.config.custom.tsaUrl + 'stamp', {
            file_hash: hashFile
        })
        .then((response) => {               
            if(response.status == 200 && response.data.tx_hash !== undefined){                                        
                return res.status(200).json({
                    status: 'success',
                    infoStamp : response.data
                });
            } else {
                return res.badRequest(res)
            }
        })
        .catch((error) => {        
            return res.badRequest(error)
        });
    },

    verify: async function (req, res) {
        if(!req.body.comprobanteOTS) return res.badRequest("Se esperaba el parametro comprobanteOTS");
        if(!req.body.hashFile) return res.badRequest("Se esperaba el parametro hashFile");
        
        const comprobanteOTS = req.body.comprobanteOTS;        
        const hashFile = req.body.hashFile;

        const urlVerify = sails.config.custom.tsaUrl + 'verify/'+comprobanteOTS+'/'+hashFile;
        
        await axios.get(urlVerify)
        .then( response => { 
               
            return res.status(200).json({
                status: 'success',
                verifyInfo: response.data
            });
        })
        .catch(function (error) {            
            return res.badRequest(error.toString());
        }); 
    }
};

