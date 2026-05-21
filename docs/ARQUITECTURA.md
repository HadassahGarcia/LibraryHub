# Arquitectura LibraryHub

## Stack

- **Backend:** Node.js puro (`node:http`), TypeScript, Firebase Admin SDK, Firestore.
- **Frontend:** React 18 + Vite + TypeScript, React Router, Zustand, TailwindCSS, shadcn/ui.
- **Auth:** Firebase Authentication (email/password) + ID token + refresh token.
- **DB:** Firestore (colecciones: `users`, `books`, `authors`, `book-categories`, `loans`, `fines`, `roles`, `audit`).

---

## Diagrama de módulos

```
LibraryHub
├── backend/
│   ├── server.ts            ← HTTP server + CORS + headers seguridad
│   ├── routes/
│   │   ├── router.ts        ← Router propio (regex + params + guards)
│   │   └── index.ts         ← Definición de endpoints
│   ├── middleware/
│   │   ├── auth.ts          ← attachUser + roleAllowed
│   │   └── rateLimit.ts     ← Rate limit en memoria
│   ├── repositories/
│   │   └── firestoreRepository.ts  ← CRUD genérico Firestore
│   ├── services/
│   │   └── audit.ts         ← Registro de auditoría
│   ├── utils/               ← response, validation, request, jwt helpers
│   ├── config/              ← env, firebase
│   └── scripts/seed.ts      ← Seed inicial
│
└── frontend/
    ├── src/
    │   ├── App.tsx          ← Router + ProtectedRoute
    │   ├── pages/           ← Login, Dashboard, Catalog, BookDetail, ...
    │   ├── components/
    │   │   ├── layout/      ← PublicLayout, AdminLayout
    │   │   ├── admin/       ← Tablas + modales por módulo
    │   │   └── ui/          ← shadcn primitives
    │   ├── store/           ← useAuthStore, useLibraryStore (Zustand)
    │   ├── lib/             ← api.ts (httpClient), firebase.ts
    │   └── types/library.ts
    └── .env.example
```

---

## Roles

| Rol           | Acceso                                                     |
| ------------- | ---------------------------------------------------------- |
| Administrador | Total: users, roles, audit, books, authors, loans, fines.  |
| Bibliotecario | Books, authors, categories, loans, fines (no users/roles). |
| Usuario       | Catálogo público, perfil, propios préstamos/multas.        |

Aliases soportados: `Admin`, `Librarian`, `User` ↔ español.

---

## Entidades principales

### User
`{ id, email, name, role, status }` — `status ∈ {active, inactive}`

### Book
`{ id, title, author, category, isbn, status, cover, description, publishedYear }`
`status ∈ {Disponible, Prestado, Mantenimiento, Baja}`

### Author
`{ id, name, bio }`

### BookCategory
`{ id, name }`

### Loan
`{ id, bookId, userId, userName, borrowDate, dueDate, returnDate, status }`
`status ∈ {Activo, Devuelto}`

### Fine
`{ id, userId, userName, amount, reason, status, loanId, paidAt? }`
`status ∈ {Pendiente, Pagado}`

### AuditEntry
`{ id, action, entity, entityId, userId, userEmail, ip, metadata, at }`

---

## Flujo Auth

1. `POST /api/auth/login` → backend llama Firebase REST `signInWithPassword` → devuelve `{ token, refreshToken, expiresIn, user }`.
2. Frontend guarda token en Zustand + localStorage.
3. Requests privadas mandan `Authorization: Bearer <idToken>`.
4. `attachUser` verifica con `auth.verifyIdToken` + carga perfil Firestore.
5. `roleAllowed` valida rol contra ruta.
6. `POST /api/auth/refresh` → `securetoken.googleapis.com` para renovar.
7. `POST /api/auth/logout` → `auth.revokeRefreshTokens(uid)` invalida sesión.

---

## Endpoints (resumen)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout` 🔒
- `GET /api/auth/me` 🔒
- `POST /api/auth/refresh`
- `PATCH /api/auth/change-password` 🔒

### Users 🔒
- `GET /api/users` (staff)
- `GET /api/users/:id`
- `POST /api/users` (admin)
- `PUT /api/users/:id` (admin)
- `PATCH /api/users/:id/status` (admin)
- `DELETE /api/users/:id` (admin)
- `GET /api/users/:id/loans`

### Roles 🔒 (admin)
- `GET|POST /api/roles`
- `PUT|DELETE /api/roles/:id`
- `GET /api/permissions`

### Books
- `GET /api/books`, `GET /api/books/:id` (público)
- `POST /api/books` 🔒 (staff)
- `PUT /api/books/:id` 🔒 (staff)
- `PATCH /api/books/:id/status` 🔒 (staff)
- `DELETE /api/books/:id` 🔒 (staff)

### Authors
- `GET /api/authors` (público)
- `POST|PUT|DELETE /api/authors[/:id]` 🔒 (staff)

### Book Categories
- `GET /api/book-categories` (público)
- `POST|PUT|DELETE /api/book-categories[/:id]` 🔒 (staff)

### Loans 🔒
- `GET /api/loans` (staff)
- `POST /api/loans` (staff) — valida disponibilidad + multas pendientes
- `POST /api/loans/:id/return` (staff) — calcula multa si retraso

### Fines 🔒
- `GET /api/fines`
- `POST /api/fines/:id/pay` (staff)

### Otros 🔒
- `GET /api/dashboard/summary` (staff)
- `GET /api/audit` (admin)
- `GET /api/health` (público)

---

## Reglas de negocio

1. Libro debe estar `Disponible` para prestar.
2. Usuario con multas `Pendiente` no puede recibir préstamo.
3. Multa = `lateDays * FINE_PER_DAY` (env `FINE_PER_DAY`).
4. Devolución cambia libro a `Disponible` y crea multa si aplica.
5. Logout revoca refresh tokens del usuario.

---

## Seguridad

| Capa             | Implementación                                                       |
| ---------------- | -------------------------------------------------------------------- |
| Tokens           | Firebase ID token (1h) + refresh token. Logout revoca refresh.       |
| Password         | Firebase Auth (hash interno equivalente bcrypt/scrypt).              |
| Validación       | `requiredString`, `optionalString`, `assertEmail`, etc.              |
| Autorización     | `attachUser` + `roleAllowed` por ruta.                               |
| CORS             | Origen único vía `FRONTEND_ORIGIN`.                                  |
| Rate limit       | 8 intentos / 15 min en login y register (por IP).                    |
| Headers          | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.      |
| Errores          | JSON estándar `{success, message, error.code}` sin stack trace.      |
| Auditoría        | login, logout, create, update, delete, status_change, loan_return, fine_payment, change_password. |

---

## Respuesta JSON estándar

```json
{ "success": true, "message": "...", "data": {} }
```

```json
{ "success": false, "message": "...", "error": { "code": "CODE", "details": [] } }
```

---

## Variables de entorno

### Backend (`backend/.env`)
- `PORT` (default 4000)
- `FRONTEND_ORIGIN` (default `http://localhost:5173`)
- `FIREBASE_SERVICE_ACCOUNT` (JSON o ruta)
- `FIREBASE_WEB_API_KEY`
- `FINE_PER_DAY` (default numérico)

### Frontend (`frontend/.env`)
- `VITE_API_URL` (ej. `http://localhost:4000`)
- `VITE_FIREBASE_*` (config cliente si aplica)

---

## Capturas

Ver `docs/screenshots/` (pendiente: agregar imágenes de Login, Dashboard, Catálogo, BooksManagement, LoansManagement, FinesManagement).
