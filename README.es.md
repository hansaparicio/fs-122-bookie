# Proyecto Bookie

## Dagline para este Sprint [ 19 - 26 Jan]

- **Hardcodear** los usuarios involucrados en un thread chat, poner un input externo de que usuario soy POC react chat [DL 20 Jan] @GERMAN @Karol Kusmierz
  Realizar pagina de perfil [DL 19 Jan] @Karol Kusmierz
  Implementar el uploading de la imagen https://cloudinary.com/documentation/react_image_and_video_upload [DL 19 Jan] @Karol Kusmierz
- Mejoras en el selecionador de libros [DL 25 Jan]
  Primero intentar rescatar el codigo ISBN
  Enlazar en perfil los libros que se han previamente leido
  Realiza una pagina de historial de libros leidos
- Revisar el endpoint de la creacion de eventos que fallo en la demo @Lorena07
- POLANDNAILS va sugerirte libros, le van preguntar a usuario cosas de libros en general para darle una sugerencia, tendra un boton llamado sorprendeme [DL 26 Jan] @Karol Kusmierz

### Endpoints Stream Chat:

├── GET /api/chat/stream-token → Genera token de Stream para el usuario
├── POST /api/chat/create-channel → Crea un canal nuevo
├── POST /api/chat/join-channel/<id> → Une al usuario a un canal existente
├── GET /api/chat/public-channels → Lista todos los canales públicos de libros
└── POST /api/chat/create-or-join-channel → Crea o une a un canal (más usado)
