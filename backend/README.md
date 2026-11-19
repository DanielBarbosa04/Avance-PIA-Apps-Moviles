# Backend de DynaMD

Requiere Node 24.7 o superior (el hash Argon2id usa `crypto.argon2`) y MySQL.
Cada integrante usa su propio MySQL y su propio `backend/.env`.
Las contraseñas y el `JWT_SECRET` nunca se comparten por chat ni se suben a Git.

## 1. Crear la base y el usuario

En una consola de MySQL con un usuario administrador (cambia `TU_CONTRASENA`
por una que elijas tú):

```sql
CREATE DATABASE dynamd;
CREATE DATABASE dynamd_shadow;
CREATE USER 'dynamd_app'@'localhost' IDENTIFIED BY 'TU_CONTRASENA';
GRANT ALL PRIVILEGES ON dynamd.* TO 'dynamd_app'@'localhost';
GRANT ALL PRIVILEGES ON dynamd_shadow.* TO 'dynamd_app'@'localhost';
FLUSH PRIVILEGES;
```

## 2. Configurar `.env`

Copia `.env.example` a `.env`, pon tu usuario `dynamd_app` y tu contraseña
en `DATABASE_URL`, `SHADOW_DATABASE_URL` y `DATABASE_PASSWORD`, y genera tu
`JWT_SECRET` con el comando que indica el propio archivo.
Si la contraseña tiene caracteres especiales, en las dos URL deben ir
codificados (por ejemplo `@` se escribe `%40`).

## 3. Instalar, migrar y arrancar

Desde `backend/`:

```powershell
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Pruebas

```powershell
npm run typecheck
npm run prueba
```

`npm run prueba` usa una base de datos falsa en memoria: no toca tu MySQL.
