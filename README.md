﻿# Backend para la página de de Cihuatl Michin	

Puedes visitar la aplicación en el siguiente enlace:

[https://fabianmaes.github.io/cihuatl-michin/index](https://fabianmaes.github.io/cihuatl-michin/index)

Y el repositorio de la aplicación frontend en: 

[https://github.com/fabianmaes/cihuatl-michin](https://github.com/fabianmaes/cihuatl-michin)

Este es un servidor backend construido con **Express**, **MongoDB** y **Mailgun.js** para gestionar blogs, autorías, vistas y etiquetas, además de enviar correos electrónicos. El servidor también maneja las solicitudes CORS y se conecta a una base de datos MongoDB para almacenar la información.

## Tecnologías Utilizadas

- **Node.js** y **Express** para el servidor.
- **MongoDB** para la base de datos.
- **Mailgun.js** para enviar correos electrónicos (aún por configurar correctamente).
- **dotenv** para manejar las variables de entorno.
- **CORS** para gestionar el acceso desde diferentes orígenes.
- **form-data** para trabajar con formularios que envían datos.

## Instalación

### Requisitos Previos

Asegúrate de tener instalados:

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (u otro servidor de MongoDB)
- [Mailgun API](https://www.mailgun.com/) (si se planea habilitar los correos)

### Pasos para la instalación

1. Clona este repositorio:
   ```bash
   git clone <url_del_repositorio>
   cd <directorio_del_proyecto>
    ```

2. Instala las dependencias necesarias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias:

   ```env
   API_KEY=tu_api_key_de_mailgun
   MONGO_URI=tu_uri_de_conexion_a_mongo
   DATABASE_NAME=nombre_de_tu_base_de_datos
   COLLECTION_NAME=nombre_de_tu_coleccion
   EMAIL_TO="nombre_destinatario <correo_destinatario>"
   ```

    ### Nota
    EMAIL_TO es el correo al que se enviarán los mensajes.
    Funciona en el entorno local, pero al desplegarlo en producción, por ejemplo a Heroku, la variable de entorno EMAIL_TO se debe cambiar a solo el correo, sin el nombre.

    ```env
    EMAIL_TO=correo_destinatario
    ```

4. Ejecuta el servidor:

   ```bash
   npm start
   ```

El servidor debería estar corriendo en `http://localhost:3000` (o el puerto que hayas configurado).

## Rutas de la API

### `GET /blogs_preview`

Devuelve una lista de blogs con un resumen (título, autor, etiquetas, vistas, likes, resumen, fechas de creación y actualización).

**Respuesta:**

* 200 OK: Retorna una lista de blogs.
* 500 Error: Si ocurre un error al obtener los blogs.

### `GET /blog/:id`

Devuelve un blog específico según su ID. Además, incrementa el contador de vistas del blog.

**Parámetros:**

* `id` (de la URL): ID del blog.

**Respuesta:**

* 200 OK: Retorna el blog con el contador de vistas actualizado.
* 404 Not Found: Si no se encuentra el blog.
* 500 Error: Si ocurre un error al obtener el blog.

### `GET /tags`

Devuelve una lista de etiquetas usadas en los blogs, ordenadas por frecuencia (de mayor a menor).

**Respuesta:**

* 200 OK: Retorna una lista de etiquetas con su cantidad de uso.
* 500 Error: Si ocurre un error al obtener las etiquetas.

### `GET /authors`

Devuelve una lista de autores que han publicado blogs.

**Respuesta:**

* 200 OK: Retorna una lista de autores.
* 500 Error: Si ocurre un error al obtener los autores.

### `GET /like/:id/:like`

Devuelve un like específico para un blog según su ID y el tipo de like (positivo o negativo).

**Parámetros:**

* `id` (de la URL): ID del blog.
* `like` (de la URL): Tipo de like (1 para positivo, -1 para negativo).

**Respuesta:**

* 200 OK: Retorna el estado del like actualizado.
* 404 Not Found: Si no se encuentra el blog.
* 500 Error: Si ocurre un error al procesar el like.

### `POST /send-email`

Envía un correo electrónico. Devuelve un estado de éxito o error al intentar enviar un correo electrónico.

**Parámetros:**
- `email` (en el cuerpo de la solicitud): Dirección de correo electrónico del destinatario.
- `subject` (en el cuerpo de la solicitud): Asunto del correo.
- `message` (en el cuerpo de la solicitud): Contenido del correo.
- `name` (en el cuerpo de la solicitud): Nombre del remitente.

**Respuesta:**
* 200 OK: Retorna un mensaje de éxito.
* 400 Bad Request: Si faltan parámetros requeridos.
* 500 Error: Si ocurre un error al enviar el correo.

## Enviar Correos (Mailgun)

Aunque el servidor tiene la configuración de **Mailgun** (para enviar correos), esta funcionalidad aún necesita ser configurada correctamente para enviar mensajes.

1. Asegúrate de tener configurada tu cuenta de **Mailgun** y de ingresar las claves en el archivo `.env` bajo `API_KEY` y `EMAIL_TO`.

## CORS

Este servidor está configurado para aceptar solicitudes de los siguientes orígenes:

* `http://localhost:4200` (entorno local Angular)
* `https://fabianmaes.github.io` (sitio en producción)
* `https://fabianmaes.github.io/cihuatl-michin` (sitio en producción)

Si se intenta acceder desde un origen no permitido, el servidor responderá con un error CORS.
