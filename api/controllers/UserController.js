/**
 * UsuarioController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 module.exports = {

    async add(req, res) {
        const data = req.body;

        // Valido errores
        if(!data.email) return res.badRequest('Falta el campo email');
        if(!data.password) return res.badRequest('Falta el campo password');        
        
        // Creo usuario
        const user = await User.create({
            email: data.email.toLowerCase(),
            password: data.password,            
            emailStatus: 'unconfirmed',
            emailProofToken: jwToken.issue({ id: data.email }),            
            emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL,            
        }).fetch();
        
        // Valido el email ingresado
        if (sails.config.custom.verifyEmailAddresses) {

            await sails.helpers.sendTemplateEmail.with({
                to: data.email.toLowerCase(),
                subject: 'Confirma tu cuenta',
                template: 'email-verify-account',
                templateData: {
                    fullName: user.email,
                    token: user.emailProofToken,
                    password: req.body.password,
                    telefono: req.body.telefono,
                }
            });
        } else {
            sails.log.info('Skipping new account email verification... (since `verifyEmailAddresses` is disabled)');
        }

        // Valido telefono vía whatsapp
        if (sails.config.custom.verifyTelefono) {

            await sails.helpers.enviarWhatsapp.with({        
                telefono: '549'+user.telefono,
                tipo_mensaje: 'codigo_validacion',
                texto : '',
                usuario_id : user.id
              });   
        } else {
            sails.log.info('Skipping new account telephone verification... (since `verifyTelefono` is disabled)');
        }

        return res.status(200).json({ 
            status: 'success',
            message: 'El usuario se creó con éxito',
            token: jwToken.issue({ id: user.id }),
            userId : user.id
        });

    },

    async edit(req, res) {
        // TODO
    },
    async delete(req, res) {
        // TODO
    },

    async login(req, res) {
        const data = req.body;

        if (!data.email || !data.password) return res.send({ status: 'error', messge: 'El campo email y password son requeridos', });

        Usuario.findOne({ email: data.email })
            .then((user) => {
                if (!user) return res.notFound();
                
                Usuario.comparePassword(data.password, user.encryptedPassword)
                    .then( async () => {
                        console.log("Login success to", data.email);

                        // Obtengo el estado del token                        
                        var user = await Usuario.findOne({ email: data.email });
                        
                        return res.send({
                            status: 'success' ,
                            token: jwToken.issue({ id: user.id }),
                            usuario_id : user.id, // Retorno el ID del Usuario
                            emailStatus: user.emailStatus // Retorno el estado del token
                        })
                    })
                    .catch((err) => {
                        sails.log.error(err);
                        return res.send({ status: 'error', messge: err, });
                    });
            })
            .catch((err) => {
                sails.log.error(err);
                return res.send({ status: 'error', messge: err, });
            });
    },
    
    async confirmarEmail(req, res) {

        // If no token was provided, this is automatically invalid.
        if (!req.query.token) {
            console.log("El token no existe");
            return res.redirect(process.env.FRONTURL + '/afterVerifyError' || 'http://mdzfidu.umbot.com.ar/afterVerifyError');
        }

        // Get the user with the matching email token.
        var user = await Usuario.findOne({ emailProofToken: req.query.token });

        // If no such user exists, or their token is expired, bail.
        if (!user || user.emailProofTokenExpiresAt <= Date.now()) {
            console.log("El token expiró");
            return res.redirect(process.env.FRONTURL + '/afterVerifyError' || 'http://mdzfidu.umbot.com.ar/afterVerifyError');
        }

        if (user.emailStatus === 'unconfirmed') {
            //  ┌─┐┌─┐┌┐┌┌─┐┬┬─┐┌┬┐┬┌┐┌┌─┐  ╔═╗╦╦═╗╔═╗╔╦╗ ╔╦╗╦╔╦╗╔═╗  ╦ ╦╔═╗╔═╗╦═╗  ┌─┐┌┬┐┌─┐┬┬
            //  │  │ ││││├┤ │├┬┘││││││││ ┬  ╠╣ ║╠╦╝╚═╗ ║───║ ║║║║║╣   ║ ║╚═╗║╣ ╠╦╝  ├┤ │││├─┤││
            //  └─┘└─┘┘└┘└  ┴┴└─┴ ┴┴┘└┘└─┘  ╚  ╩╩╚═╚═╝ ╩   ╩ ╩╩ ╩╚═╝  ╚═╝╚═╝╚═╝╩╚═  └─┘┴ ┴┴ ┴┴┴─┘
            // If this is a new user confirming their email for the first time,
            // then just update the state of their user record in the database,
            // store their user id in the session (just in case they aren't logged
            // in already), and then redirect them to the "email confirmed" page.

            
            await Usuario.updateOne({ id: user.id }).set({
                emailStatus: 'confirmed',
                emailProofToken: '',
                emailProofTokenExpiresAt: 0
            });
            
            // Si el token se validó bien, te redirijo al login del front
            return res.redirect(process.env.FRONTURL + '/afterVerifyOk' || 'http://mdzfidu.umbot.com.ar/afterVerifyOk');

        } else {
            return res.redirect(process.env.FRONTURL + '/afterVerifyError' || 'http://mdzfidu.umbot.com.ar/afterVerifyError');            
        }

    },

    // Verifica que el token envíado es válido
    validarToken (req, res) {
        return res.send({ status: 'success', message : 'El token es válido' })
    },

    // Retorno un usuario específico
    async get(req, res){
        if(!req.params.usuario_id) res.send({ status: 'error', messge: 'Falta el campo usuario_id', });

        const user = await Usuario.find({ id : req.params.usuario_id});

        return res.send({
            status: 'status',
            user: user,
        });
    },

    // Retorna todos los usuarios
    async list(req, res){
        
        const users = await Usuario.find();

        return res.send({
            status: 'status',
            users: users,
        });
    }



};

