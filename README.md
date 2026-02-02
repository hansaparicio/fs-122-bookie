## Bookie – Club de lectura social con chat por libro

Bookie es una aplicación web que combina **clubes de lectura**, **eventos** y **chat en tiempo real** organizado por libro (ISBN).  
La idea: cada libro tiene su **propio canal de chat**, compartido por todas las personas que lo están leyendo.

---

### 🧩 Tecnologías principales

- **Frontend**: React + Vite, React Router, Bootstrap, Stream Chat React.
- **Backend**: Python + Flask, SQLAlchemy, JWT para auth, Stream Chat (SDK de servidor).
- **Base de datos**: SQLite en desarrollo, Postgres en despliegue.

---

### ⚙️ Puesta en marcha rápida (local)

#### 1. Backend (Flask)

```bash
cd src/api
pipenv install          # instala dependencias
cp .env.example .env    # copia el ejemplo y edita tus variables
pipenv run migrate      # genera migraciones (si hace falta)
pipenv run upgrade      # aplica migraciones
pipenv run start        # lanza el backend (por defecto http://localhost:3001)
```

Variables importantes en el `.env` del backend:

- `DATABASE_URL` – conexión a la base de datos.
- `JWT_SECRET_KEY` – clave usada para firmar los tokens.
- `STREAM_API_KEY` y `STREAM_API_SECRET` – credenciales de Stream Chat.

#### 2. Frontend (React)

```bash
cd src/front
npm install
npm run dev   # o npm run start
```

En el `.env` del frontend (raíz del proyecto) asegúrate de tener algo como:

```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_STREAM_API_KEY=<tu_api_key_de_stream>
```

---

### 🔐 Autenticación y chat

- El usuario inicia sesión y recibe un **access token JWT** y un **stream_token**.
- El frontend guarda esos valores en `localStorage` y los envía en el header `Authorization: Bearer <token>` a las rutas protegidas (`/api/chat/*`, `/api/library/*`, etc.).
- Cada canal de chat por libro usa un id de la forma:
  - `book-isbn-<ISBN_NORMALIZADO>`
- El backend expone, entre otros, estos endpoints de chat:
  - `GET /api/stream-token` – genera el token de Stream para el usuario.
  - `POST /api/chat/create-or-join-channel-by-isbn` – crea o une al canal de un libro por ISBN.
  - `GET /api/chat/channel-members-by-isbn?isbn=...` – devuelve miembros del canal (id, name, image) para mostrar avatares.

---

### 📚 Funcionalidades principales

- **Home / Reading Now**
  - Mostrar el libro seleccionado (portada, título, ISBN).
  - Abrir el chat asociado a ese libro con **Open Chat**.
  - Ver en **Like-minded readers** las fotos de perfil reales de quienes están/han estado en el chat de ese libro.

- **Library**
  - Buscar libros (Google Books).
  - Añadir libros a la biblioteca del usuario (evitando duplicados).

- **Events**
  - Crear eventos de lectura (clubs, meetups, etc.).
  - Ver lista de próximos eventos con fecha, hora y categoría.

- **AI Chat (recomendador)**
  - Bot conversacional que recomienda libros según tus gustos.

---

### 🚀 Despliegue

El repositorio incluye configuración para desplegar en **Render** u otros servicios compatibles con Docker:

- `Dockerfile.render`
- `render.yaml`
- `requirements.txt`

Adapta esas configuraciones a tu entorno y apunta `VITE_BACKEND_URL` al dominio/puerto del backend desplegado.

