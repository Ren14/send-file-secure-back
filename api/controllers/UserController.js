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

        if (!data.email || !data.password) return res.badRequest('El campo email y password son requeridos');

        User.findOne({ email: data.email })
            .then((user) => {
                if (!user) return res.badRequest('Usuario no encontrado');
                
                User.comparePassword(data.password, user.encryptedPassword)
                    .then( async () => {
                        console.log("Login success to", data.email);
                        
                        return res.send({
                            status: 'success' ,
                            token: jwToken.issue({ id: user.id }),                            
                        })
                    })
                    .catch((err) => {
                        sails.log.error(err);
                        return res.badRequest( err );
                    });
            })
            .catch((err) => {
                sails.log.error(err);
                return res.badRequest( err );
            });
    },
    
    async confirmarEmail(req, res) {

        // If no token was provided, this is automatically invalid.
        if (!req.query.token) return res.badRequest( 'Se esperaba el parametro token' );

        // Get the user with the matching email token.
        var user = await Usuario.findOne({ emailProofToken: req.query.token });

        // If no such user exists, or their token is expired, bail.
        if (!user || user.emailProofTokenExpiresAt <= Date.now()) return res.badRequest( 'El token ha expirado' );

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
            return res.status(200).json({
                status: 'success',
                msg: 'El usuario fue validado con exito'
            });

        } else {
            return res.badRequest( 'El mail ya fue confirmado' );           
        }

    },

    // Verifica que el token envíado es válido
    validarToken (req, res) {
        return res.send({ status: 'success', message : 'El token es válido' })
    },

    // Retorno un usuario específico
    async get(req, res){
        if(!req.params.usuario_id) return res.badRequest('Falta el campo usuario_id');

        const user = await Usuario.find({ id : req.params.usuario_id});

        return res.status(200).json({
            status: 'success',
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

