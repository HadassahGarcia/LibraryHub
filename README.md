# LibraryHub

LibraryHub es un sistema de biblioteca con una API en Node.js puro y un frontend en React con Vite. Usa Firebase Authentication para las cuentas y Firestore para guardar libros, autores, categorias, usuarios, prestamos, multas y auditoria.

## Requisitos

Necesitas Node.js 20 o superior y un proyecto de Firebase con Authentication por correo/password y Firestore habilitados. El backend requiere credenciales de Firebase Admin.

## Instalacion

El proyecto se instala por separado en backend y frontend.

```bash
cd backend
npm install

cd ../frontend
npm install
```

Configura las variables de entorno usando los archivos `.env.example` de cada carpeta. En backend van las credenciales de Firebase Admin, la API key web, el origen permitido del frontend y el valor diario de multa. En frontend van la URL de la API y la configuracion publica de Firebase.

## Ejecutar en local

Levanta primero la API:

```bash
cd backend
npm run dev
```

Luego inicia el frontend:

```bash
cd frontend
npm run dev
```

La API corre en `http://localhost:4000` y el frontend en `http://localhost:5173`.

## Datos de prueba

Para cargar libros, autores, categorias, usuarios, prestamos y multas iniciales:

```bash
cd backend
npm run seed
```

Usuario demo:

```text
Email: admin@library.com
Password: LibraryHub123!
```

## Que incluye

La API cubre autenticacion, usuarios, roles, permisos, libros, autores, categorias, prestamos, devoluciones, multas, dashboard, auditoria y health check. El frontend incluye catalogo publico, detalle de libro, perfil, login y panel administrativo.

Las reglas principales son simples: no se presta un libro que no este disponible, no se presta a usuarios con multas pendientes, las devoluciones calculan multa por retraso y no se eliminan usuarios, libros, autores o categorias si tienen relaciones activas.

## Endpoints principales

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
PATCH  /api/auth/change-password

GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/status
DELETE /api/users/:id

GET    /api/roles
POST   /api/roles
PUT    /api/roles/:id
DELETE /api/roles/:id
GET    /api/permissions

GET    /api/books
GET    /api/books/:id
POST   /api/books
PUT    /api/books/:id
PATCH  /api/books/:id/status
DELETE /api/books/:id

GET    /api/authors
POST   /api/authors
PUT    /api/authors/:id
DELETE /api/authors/:id

GET    /api/book-categories
POST   /api/book-categories
PUT    /api/book-categories/:id
DELETE /api/book-categories/:id

GET    /api/loans
POST   /api/loans
POST   /api/loans/request
POST   /api/loans/:id/return
GET    /api/users/:id/loans

GET    /api/fines
POST   /api/fines/:id/pay

GET    /api/dashboard/summary
GET    /api/audit
GET    /api/health
```

## Revision manual sugerida

Despues del seed, inicia sesion con el usuario demo y prueba el flujo basico: crear un libro, prestarlo, intentar prestarlo otra vez, registrar devolucion y pagar una multa. Tambien conviene revisar que el panel bloquee borrados cuando hay prestamos activos o libros asociados.
