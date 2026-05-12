# LibraryHub

Sistema fullstack para biblioteca con React + Vite, backend Node.js puro y Firebase/Firestore.

## Requisitos

- Node.js 20+
- Proyecto Firebase con Authentication por email/contraseña habilitado.
- Firestore habilitado.
- Service account de Firebase Admin para el backend.

## Instalación

```bash
npm install
```

Copia `.env.example` a `.env` en la raíz o usa `frontend/.env` y `backend/.env` con los mismos valores correspondientes.

## Ejecución

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000`

## Seed

```bash
npm run seed
```

Usuario demo:

- Email: `admin@library.com`
- Password: `LibraryHub123!`

## Scripts

- `npm run dev`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run lint`
- `npm run seed`

## Endpoints Principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/books`
- `GET/POST/PUT/DELETE /api/authors`
- `GET/POST/PUT/DELETE /api/book-categories`
- `GET/POST /api/loans`
- `POST /api/loans/:id/return`
- `GET /api/users/:id/loans`
- `GET /api/fines`
- `POST /api/fines/:id/pay`
- `GET /api/dashboard/summary`
- `GET /api/audit`
- `GET /api/health`

## Pruebas Manuales Sugeridas

1. Ejecutar seed.
2. Iniciar sesión con el usuario demo.
3. Crear, editar y eliminar libros.
4. Crear, editar y eliminar autores.
5. Crear, editar y eliminar categorías.
6. Validar que no se preste un libro no disponible.
7. Validar que un usuario con multa pendiente no reciba préstamo.
8. Registrar devolución y revisar multa generada por retraso.
9. Pagar multa.
10. Revisar dashboard, perfil e historial de préstamos.

