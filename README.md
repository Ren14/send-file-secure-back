# send-file-secure-back

Back-end del proyecto "Envío de documentos seguros por IPFS"

### Instalación de código fuente y pruebas

```
git clone git clone https://github.com/Ren14/send-file-secure-back.git

cd send-file-secure-back

npm install

mkdir assets/encryptFiles

npm test
```

### Ejecutar mediante docker-compose

Se requiere tener instalado docker y docker-compose, y haber realizado los pasos anteriores (instalación del código fuente).
Luego acceder al archivo `./docker-compose.yml` y en la `línea #18` configurar el path donde está instalado el repositorio en tu localhost.

A continuación ejecutar los siguientes pasos:

```

cd send-file-secure-back

docker-compose up

```
Se crearán dos contenedores, uno para el back-end y otro para la base de datos.

### Paper enviado al congreso LACCEI 2021
Este documento es la base teórica del proyecto.
[LACCEI Envío de documentos seguros por IPFS.pdf](https://github.com/Ren14/send-file-secure-back/files/6535583/LACCEI.Envio.de.documentos.seguros.por.IPFS.pdf)
