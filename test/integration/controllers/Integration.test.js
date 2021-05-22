var supertest = require('supertest');
var assert = require('assert');
let token;
let fileName;
let publicKey;
let privateKey;
let signature;
let ipfsPath;
let comprobanteOTS;
let txHash;
let hashFile;
let hashFileAfterDownload;
const emailTo = "renn.carp@gmail.com";
const userNameTo = "Renzo Ontivero";
const userNameFrom = "Cosme Fulanito";
const fileId = 1; // Funcionalidad aún no implementada

//============================================================================================================================
//================================== CASO DE USO ENVIAR ARCHIVO ==============================================================
//============================================================================================================================

describe('>>>>> UserController.js', function () {

    // 1. El usuario que desea enviar un archivo, se registra en la aplicación
    describe('#add()', function () {
        it('Registro de usuario', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/user')
                .send({ email: 'renn.carp@gmail.com', password: '123456' })
                .then(response => {
                    assert(response.body.status, 'success')
                    // Acá se debería almacenar el token, pero lo probamos en el siguiente Test
                    done();
                })
                .catch(err => done(err))

        });
    });

    // Probamos que el login funcione correctamente
    describe('#login()', function () {
        it('Login de usuario', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/user/login')
                .send({ email: 'renn.carp@gmail.com', password: '123456' })
                .then(response => {                    
                    assert(response.body.status, 'success')  
                    token = response.body.token; // Almacenamos el token para utilizar en los próximos casos de prueba                  
                    done();
                })
                .catch(err => done(err))

        });
    });

});

describe('>>>>> FileManagementController.js', function () {
    this.timeout(0); // Seteamos para permitir que el caso de testing no tenga un tiempo máximo de ejecución

    // 2. El usuario adjunta el archivo y pulsa el botón enviar.
    describe('#uploadFile()', function () {
        it('Subida de archivo', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/file-management/upload-file')
                .attach('file', 'test/files/test.txt') // Utilizamos un archivo de prueba
                .set('token', token) // Enviamos el token en el header
                .then(response => {                    
                    assert(response.body.status, 'success')
                    fileName = response.body.fileName;  // Almacenamos el nombre del archivo con el que se guardó en el sistema de archivos
                    done();
                })
                .catch(err => done(err))

        });
    });

});

describe('>>>>> CryptographyController.js', function () {
    this.timeout(0);

    // 3. El sistema obtiene el hash del archivo que subio el usuario en el paso 2.
    describe('#hashFile()', function () {
        it('Obteniendo hash sha256 del archivo, antes de ser subido a IPFS', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/cryptography/hash-file')                
                .set('token', token)
                .send({fileName: fileName}) // Enviamos el nombre del archivo, y el sistema busca en su sistema de archivos
                .then(response => {                    
                    assert(response.body.status, 'success')
                    hashFile = response.body.hashFile; // Almacenamos el hash del archivo                    
                    done();
                })
                .catch(err => done(err))

        });
    });

    // 4. La primera vez que el usuario procede a enviar, debe generar las claves publica y privada.
    // Lo mismo debe suceder con el usuario receptor del archivo (para este caso de pruebas las claves están harcodeadas por código)
    describe('#generateKeys()', function () {
        it('Generacion de claves publica y privada', function (done) {
            supertest(sails.hooks.http.app)
                .get('/api/v1/cryptography/generate-keys')                
                .set('token', token)
                .then(response => {                    
                    assert(response.body.status, 'success')
                    publicKey = response.body.keys.publicKey;
                    privateKey = response.body.keys.privateKey;
                    done();
                })
                .catch(err => done(err))

        });
    });
    
    // 5. Procedemos a firmar el archivo con la CLAVE PRIVADA del EMISOR.
    describe('#signFile()', function () {
        it('Firmando el archivo', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/cryptography/sign-file')                
                .set('token', token)
                .send({ fileName: fileName, privateKey: privateKey })
                .then(response => {                    
                    assert(response.body.status, 'success')
                    signature = response.body.signFile; // Almacenamos la firma del archivo Original (sin encriptar)                       
                    done();
                })
                .catch(err => done(err))

        });
    });

    // 6. Procedemos a encriptar el archivo con la CLAVE PUBLICA del RECEPTOR.
    describe('#encryptFile()', function () {
        it('Encriptando el archivo', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/cryptography/encrypt-file')                
                .set('token', token)
                .send({ fileName: fileName, publicKey: publicKey })
                .then(response => {                    
                    assert(response.body.status, 'success')                    
                    done();
                })
                .catch(err => done(err))

        });
    });

});

describe('>>>>> TimeStampController.js', function () {
    this.timeout(0);

    // 7. Enviamos el hash del archivo original (sin encriptar) a estampar con blockchain
    describe('#stamp()', function () {
        it('Stamping de hash en blockchain', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/time-stamp/stamp')                
                .set('token', token)
                .send({ hashFile: hashFile })
                .then(response => {                    
                    assert(response.body.status, 'success')                    
                    comprobanteOTS = response.body.infoStamp.comprobante_ots; // Almacenamos el comprobante del stamping
                    txHash = response.body.infoStamp.tx_hash; // Almacenamos el Hash de la TX
                    done();
                })
                .catch(err => done(err))

        });
    });
});

describe('>>>>> IpfsController.js', function () {
    this.timeout(0);

    // 8. Subimos el archivo encriptado a IPFS
    describe('#uploadEncryptedFile()', function () {
        it('Subida de archivo a IPFS', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/ipfs/upload-encrypted-file')                
                .set('token', token)
                .send({ fileName: fileName })
                .then(response => {                    
                    assert(response.body.status, 'success')
                    ipfsPath = response.body.ipfs.path;  // Almacenamos el path del archivo. 
                    // Con este path, se puede ver el archivo en  https://ipfs.io/ipfs/[PATH]                   
                    // Ejemplo https://ipfs.io/ipfs/QmZ92gKN898MRgzQ916iUA9XNPMrcZ3qfB5dFkZzsrGnj9
                    // Deberíamos ver un código encriptado, no el archivo original
                    // Solo el usuario RECEPTOR, puede desencriptar este archivo con su CLAVE PRIVADA
                    done();
                })
                .catch(err => done(err))

        });
    });
});

describe('>>>>> EmailController.js', function () {
    this.timeout(0);

    // 9. Una vez que ya aplicamos las medidas de seguridad y subimos el archivo a IPFS
    // procedemos a notificar al usuario receptor, que ha recibido un archivo
    // Aquí le pasamos el fileId, para que el sistema, busque todos datos de seguridad en la BD.

    describe('#send()', function () {
        it('Envío de correo electronico', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/email/send')                
                .set('token', token)
                .send({ emailTo: emailTo, userNameTo: userNameTo, userNameFrom: userNameFrom, fileId: fileId })
                .then(response => {   
                    assert(response.body.status, 'success')                                        
                    done();
                })
                .catch(err => done(err))

        });
    });
});

// Pensamientos: Se debería borrar luego del envio del archivo, el documento original del sistema de archivos. Ya que el mismo recide
// encriptado en IPFS, y solo puede ser visto por quien tiene la clave privada asociada a la clave pubilca con que fue encriptado.

//============================================================================================================================
//================================== CASO DE USO VER ARCHIVO    ==============================================================
//============================================================================================================================

// 1. El usuario accede al correo electrónico y pulsa el enlace "VER ARCHIVO". Esto dispara un
// endpoint donde a partir de la info del usuario y fileId, se invocan los siguientes métodos
// Esta funcionalidad se debe programar y analizar para el uso óptimo.
    
describe('>>>>> IpfsController.js', function () {
    this.timeout(0);

    // 2. El sistema procede a descargar el archivo de IPFS al sistema de archivos propio
    // Sería como acceder a https://ipfs.io/ipfs/QmZ92gKN898MRgzQ916iUA9XNPMrcZ3qfB5dFkZzsrGnj9 y descargar manualmente el archivo
    describe('#downloadFile()', function () {
        it('Descargar archivo de IPFS', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/ipfs/upload-encrypted-file')                
                .set('token', token)
                .send({ fileName: fileName, ipfsPath: ipfsPath }) // Le pasamos el nombre con el que deberá almacenar el archivo, y el path de IPFS
                .then(response => {                    
                    assert(response.body.status, 'success')
                    done();
                })
                .catch(err => done(err))

        });
    });

});

describe('>>>>> CryptographyController.js', function () {    
    this.timeout(0);

    // 3. Una vez descargado, el sistema procede a desencriptar el archivo con la CLAVE PRIVADA del RECEPTOR
    describe('#decryptFile()', function () {
        it('Desencriptando archivo', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/cryptography/decrypt-file')                
                .set('token', token)
                .send({ fileName: fileName, privateKey: privateKey })
                .then(response => {                                     
                    assert(response.body.status, 'success')                    
                    done();
                })
                .catch(err => done(err))

        });
    });

    // 4. Una vez desencriptado, nuevamente se calcula el hash del archivo Original (esto sirve luego para verificar el sello de tiempo con Blockchain)
    describe('#hashFile()', function () {
        it('Obteniendo hash sha256 del archivo, luego de haberlo descargado de IPFS', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/cryptography/hash-file')                
                .set('token', token)
                .send({fileName: fileName})
                .then(response => {                    
                    assert(response.body.status, 'success')                    
                    hashFileAfterDownload = response.body.hashFile; // Almacenamos el nuevo HASH
                    done();
                })
                .catch(err => done(err))

        });
    });

    // 5. Se procede a verificar la FIRMA DIGITAL del archivo a partir de la SIGNATURA (realizada por el EMISOR con su CLAVE PRIVADA), 
    // el nombre del archivo (para buscarlo en el sistema) y la clave pública del EMISOR.    
    describe('#verifySignFile()', function () {
        it('Verificando firma del archivo', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/cryptography/verify-sign-file')
                .set('token', token)
                .send({ fileName: fileName, publicKey: publicKey, signature: signature })
                .then(response => {                                     
                    assert(response.body.status, 'success')
                    assert(response.body.verifySignFile, true)  // Se compruba que la firma sea válida                 
                    done();
                })
                .catch(err => done(err))

        });
    });    
});


describe('>>>>> TimeStampController.js', function () {
    this.timeout(0);

    // 6. Se comprueba que el documento no ha sido alterado desde que fue envíado. Para ello se invoca al metodo verify del smartContract.
    // se envía el nuevo hash del documento, y el comprobante del sello de tiempo aplicado.

    // Si el documento fuese modificado, obtendría un hash distinto al que se obtuvo al momento de enviarlo. 
    // Entonces este nuevo hash no coincidiría con los datos contenidos en el comprobanteOTS, y el SmartContract retoraría
    // un false, indicando que el documento fue modificado.

    describe('#verify()', function () {
        it('Verificacion de sello de tiempo', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/time-stamp/verify')                
                .set('token', token)
                .send({ hashFile: hashFileAfterDownload, comprobanteOTS: comprobanteOTS })
                .then(response => {   
                    assert(response.body.status, 'success')                    
                    assert(response.body.verifyInfo.status, 'pending') // Si la transacción se encuentra pendiente
                    // es correcto por que, se debe esperar al menos 5 segundos desde que se realizó el stamp
                    // para que se incluya en un bloque, y su estado cambie a success.
                    
                    done();
                })
                .catch(err => done(err))

        });
    });

    // 7. Finalmente de debería descargar del sistema de archivos el documento desencriptado del RECEPTOR. 

    // Pensamientos: 
    
    // - Luego de descargar el documento, se debería borrar del sistema de archivos el documento desencriptado, para evitar que otro 
    // usuario (hacker) tenga acceso.
    // - Se debería analizar como guardar las claves privadas de los usuarios, o si estos debieran almacenarlas y enviarlas en cada petición.
});
