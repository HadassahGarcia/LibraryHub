# Arquitectura de LibraryHub

El backend esta hecho con Node.js puro sobre `node:http`. No usa Express ni otro framework principal. La interfaz esta hecha con React 19, Vite, React Router, Zustand y TailwindCSS.

Firebase cumple dos funciones: Authentication maneja usuarios y passwords; Firestore guarda los datos del sistema.

## Backend

La entrada de la API esta en `src/server.js`. Ahi se aplican CORS, headers basicos, lectura del body y manejo uniforme de errores. El router propio vive en `src/routes/router.js`, y `src/routes/index.js` solo registra los modulos.

La logica del sistema esta separada por dominio:

```text
src/modules/
|-- auth/
|-- users/
|-- roles/
|-- books/
|-- authors/
|-- categories/
|-- loans/
|-- fines/
|-- dashboard/
|-- audit/
`-- shared/
```

Cada modulo declara sus rutas en `*.routes.js`. Los controladores preparan la respuesta HTTP y los servicios concentran reglas de negocio. El acceso a Firestore se hace mediante `repositories/firestoreRepository.js`.

Los middlewares principales son `auth.js`, para verificar token y rol, y `rateLimit.js`, usado en login y registro.

## Frontend

El frontend esta en `frontend/src`. `App.jsx` define las rutas publicas y privadas. Las paginas administrativas viven en `src/pages`, los layouts en `src/components/layout` y el estado de sesion en `src/store/useAuthStore.js`.

El cliente HTTP esta en `src/lib/api.js`. Agrega el token a cada request privado y renueva la sesion cuando recibe un `401`, usando el refresh token guardado.

## Datos principales

Firestore usa estas colecciones:

```text
users
roles
books
authors
book-categories
loans
fines
audit
```

Los roles usados por la aplicacion son `Administrador`, `Bibliotecario` y `Usuario`.

## Flujo de autenticacion

El login llega a `POST /api/auth/login`. El backend valida las credenciales con Firebase REST y devuelve ID token, refresh token y perfil del usuario. El frontend guarda esos datos en `localStorage` y manda el ID token en el header `Authorization`.

En rutas privadas, `attachUser` verifica el token con Firebase Admin y carga el perfil desde Firestore. Despues `roleAllowed` valida si el rol puede usar esa ruta.

## Reglas de biblioteca

Un libro solo puede prestarse si existe y esta disponible. Si el usuario tiene multas pendientes, la API rechaza el prestamo. Al devolver un libro, el sistema cierra el prestamo, libera el ejemplar y calcula la multa si hubo retraso.

Tambien se protegen borrados importantes: no se elimina un usuario con prestamos activos, un libro prestado, una categoria con libros o un autor con libros registrados.

## Respuesta de la API

Todas las respuestas usan el mismo formato.

```json
{ "success": true, "message": "Operacion realizada correctamente", "data": {} }
```

```json
{ "success": false, "message": "No autorizado", "error": { "code": "AUTH_UNAUTHORIZED", "details": [] } }
```

## Pendientes tecnicos

Falta agregar pruebas automatizadas para las reglas de prestamo, devolucion y borrado. Tambien conviene cambiar algunos listados completos de Firestore por consultas filtradas cuando el volumen de datos crezca.
