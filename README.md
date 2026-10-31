# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



//---------------------------------------------------------------------------------------------------
# DynaMD
# Your body. Your data
 
Aplicacion movil personal de fitness/ gimnasio, desarrollada como proyecto final de la materia **Aplicaciones Moviles**. Es de uso exclusivamente personal: no hay amigos, perfiles publicos, mensajes ni rankings
 
- **Usuario:** personas mayores de 15 años que van o quieren ir al gimnasio (mujeres y hombres, de principiante hasta avanzado)
- **Objetivo:** conocer los grupos musculares, descubrir ejercicios, seguir el peso y las fotos de progreso, y encontrar gimnasios cercanos

## Estado actual (avance)
 
| Área | Estado |
|---|---|
| Frontend base (Expo SDK 58, Expo Router, TypeScript) | Implementado |
| Identidad visual: logo fijo, pantalla de carga con slogan, paleta clara y oscura | Implementado (pero con areas de oportuinidad) |
| Backend (Express 5, TypeScript) con ruta de salud | Implementado |
| Base de datos MySQL con Prisma 7 (tabla `usuarios`) y conexión probada | Implementado |
| **Recordatorios motivacionales (notificaciones locales)** | Implementado, probado en el APK |
| Registro, inicio de sesión y perfil | Siguiente Fase |
| Mapa muscular interactivo y catálogo de ejercicios | Planeado |
| Progreso: peso corporal y fotos | Planeado |
| Gimnasios cercanos con mapa | Planeado |
 
### Funcionalidad trabajada en clase: recordatorios motivacionales
- **Paquetes:** `expo-notifications` y `@react-native-async-storage/async-storage`.
- **Qué hace:** la persona activa los recordatorios, elige la hora y los días que entrena. Recibe un mensaje al azar según sea día de entrenamiento o de descanso.
- **Implementación:** notificaciones locales programadas para los próximos 14 dias y reprogramadas al abrir la pantalla. El permiso se solicita al activar. Los ajustes se guardan solo en el teleefono.
- **Limitaciones conocidas:**
  - En **Expo Go (Android)** falla la creación del canal de notificaciones (`NullPointerException` nativo); funciona en el **APK instalado**.
  - Si la persona no abre la app durante 14 días, los recordatorios programados se agotan.

## Tecnologías 
- **Móvil:** Expo, React Native, TypeScript, Expo Router, AsyncStorage, Expo Notifications.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, MySQL.
- **Herramientas:** Visual Studio Code, Git y GitHub, npm.

## Estructura 
```
DynaMD/
├── src/
│   ├── app/            # Pantallas y rutas (Expo Router)
│   ├── componentes/    # Componentes reutilizables
│   ├── datos/          # Catalogos y textos de referencia
│   ├── estilos/        # Colores y tema
│   └── servicios/      # Servicios (por ejemplo, notificaciones)
├── backend/
│   ├── src/            # API Express
│   └── prisma/         # Esquema y migraciones de MySQL
├── assets/             # Logos e imagenes
├── app.json
└── package.json
```
 
## Ccmo ejecutarlo
### Frontend
 
Desde la raiz del proyecto:
 
```bash
npm install
npx expo start
```
 
Las notificaciones locales deben probarse en un **APK** o *development build*; en Expo Go para Android presentan el fallo descrito arriba.
 
### Backend
Requiere Node.js 24 y MySQL (se desarrolló con MySQL 9.6; Prisma documenta oficialmente 8.4 LTS como versión soportada).
 
1. En MySQL, crear la base de datos, la base auxiliar de migraciones y un usuario propio:
```sql
   CREATE DATABASE dynamd CHARACTER SET utf8mb4;
   CREATE DATABASE dynamd_shadow CHARACTER SET utf8mb4;
   CREATE USER 'dynamd_app'@'localhost' IDENTIFIED BY 'ELIGE_UNA_CONTRASENA';
   GRANT ALL PRIVILEGES ON dynamd.* TO 'dynamd_app'@'localhost';
   GRANT ALL PRIVILEGES ON dynamd_shadow.* TO 'dynamd_app'@'localhost';
```
 
2. Desde `backend/`:
```bash
   npm install
```
 
3. Copiar `.env.example` a `.env` y completar los valores con la contraseña elegida. **El archivo `.env` no se sube a Github por seguirdad**
4. Aplicar las migraciones, generar el cliente de Prisma e iniciar el servidor:
```bash
   npx prisma migrate deploy
   npx prisma generate
   npm run dev
```
 
5. Comprobar en el navegador `http://localhost:3000/api/salud` y `http://localhost:3000/api/salud/bd`.
Desde un telefono físico no sirve `localhost`: hay que usar la IP de la computadora en la misma red
 
## Privacidad y seguridad
- Las contraseñas se almacenarán solo con hash (Argon2id); nunca en texto plano.
- Las credenciales y secretos viven en variables de entorno, fuera del repositorio.
- Los ajustes de recordatorios son locales y no sensibles.
- La app no se conecta directamente a MySQL: toda la información privada pasa por la API.
- La seguridad no se considera completa hasta realizar las pruebas de autenticación y autorización previstas.

## Participacion del equipo hasta el momento
 
| Actividad | Integrante |
|---|---|
| Configuración del proyecto Expo y estructura de carpetas | [Daniel] |
| Identidad visual: logo, ícono, pantalla de carga y tema | [Daniel] |
| Instalación y configuración de MySQL, base de datos y usuario | [Daniel] |
| Backend con Express y Prisma, y migración inicial | [Daniel] |
| Implementación de los recordatorios con expo-notifications | [Daniel] |
| Pruebas en teléfono y diagnóstico del error en Expo Go | [Miguel] |
| Generación y prueba del APK | [Miguel] |
| Repositorio de GitHub y control de versiones | [Ambos] |
| Documentación y presentación | [Ambos] |