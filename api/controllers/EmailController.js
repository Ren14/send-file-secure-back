/**
 * EmailController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    send: async function (req, res) {
        if(!req.body.emailTo) return res.badRequest('Se esperaba el parametro emailTo');        
        if(!req.body.userNameTo ) return res.badRequest('Se esperaba el parametro userNameTo');
        if(!req.body.userNameFrom ) return res.badRequest('Se esperaba el parametro userNameFrom');        
        if(!req.body.fileId) return res.badRequest('Se esperaba el parametro fileId');

        const emailTo = req.body.emailTo;        
        const userNameTo = req.body.userNameTo;
        const userNameFrom = req.body.userNameFrom;
        const fileId = req.body.fileId;
        

        try {
            await sails.helpers.sendTemplateEmail.with({
                to: emailTo,
                subject: 'Recibiste un archivo digital | #' + fileId,
                template: 'email-send-encrypted-file',
                templateData: {                    
                    userNameTo: userNameTo,
                    userNameFrom: userNameFrom,
                    emailTo: emailTo,
                    fileId: fileId
                }
            });
            return res.status(200).json({
                status: 'success',
                msg: 'El email se envió con éxito'
            })
        } catch (error) {
            console.log(error);
            return res.badRequest(error);
        }
    }
};

