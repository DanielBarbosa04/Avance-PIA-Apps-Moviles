# Uso de inteligencia artificial en DynaMD

## Herramienta y modo de trabajo
- **Herramienta:** Claude (Anthropic), en conversacion de chat dentro de un proyecto de la plataforma claude.ai. Actuó como guia trcnica; no escribio directamente en un repositorio.
- **Modo:** chat, no un agente dentro del editor. Si se trabajo con un enfoque parecido a *Plan*: antes de escribir codigo se definieron la arquitectura, las tecnologias y las fases, y después se avanzo por etapas pequenias.

- **Todo el codigo fue ejecutado y probado por nosotros**

## Prompt inicial (resumen)
El primer mensaje establecimos el contexto, las reglas y el orden de trabajo:

- **Proyecto:** app móvil fitness llamada DynaMD, de uso personal, funcional
- **Tecnologías obligatorias:** Expo, React Native, TypeScript, Expo Router, Node.js.
- **Funcionalidades:** registro y sesion, mapa muscular interactivo, catalogo de ejercicios, progreso, fotos privadas, gimnasios (mapa), notificaciones y seguridad
- **Metodologia pedida a la IA:**
  - Verificar versiones compatibles antes de instalar.
  - No inventar resultados de pruebas.
  - Esperar la confirmación del equipo antes de avanzar.

> **Prompt:** 
Quiero desarrollar una aplicacion móvil de fitness y entrenamiento para mi proyecto final. El proyecto debe ser funcional, realista, visualmente atractivo, seguro y tecnicamente bien estructurado.
La aplicacion ayudara al usuario a conocer sus grupos musculares, descubrir ejercicios, guardar fotografías privadas y encontrar gimnasios cercanos.
Sera exclusivamente de uso personal. No tendra amigos, seguidores, perfiles publicos, mensajeria, rankings sociales ni funciones competitivas
Quiero construir una aplicacion real que pueda ejecutar en dispositivos móviles o emuladores. No quiero una maqueta con botones que no funcionen ni datos ficticios presentados como reales.
Trabajaremos paso a paso, comprobando cada funcionalidad antes de continuar.

## Plan de trabajo con IA

| Etapa | Que hicimos | Como se verifico |
|---|---|---|
| 1. Frontend | crear el proyecto con Expo Router y `src/app` | `expo-doctor`, `tsc` y la app corriendo en Android |
| 2. Identidad visual | Icono, pantalla de carga, logo fijo y tema | Revisión visual en el telefono |
| 3. Base de datos y backend | MySQL, Express y Prisma | Migración aplicada, tabla creada y consulta desde la API |
| 4. Funcionalidad | Recordatorios con notificaciones locales | Pruebas en Expo Go (fallo) y en el APK (funciona) |


## Decisiones tomadas por el equipo
- Sexo y peso son obligatorios en el registro: el sexo define la anatomia del mapa muscular.
- Las notificaciones pasaron a ser mensajes motivacionales aleatorios dependiendo la rutina/objetivo semanal.
- Se mantuvo MySQL 9.6 aunque Prisma solo documenta oficialmente hasta la 8.4; la migración funciono
- Prisma se fijó en la versión 7 en lugar de la candidata a la 8.
- Para el problema de las notificaciones en Expo Go, generamos un APK y comprobamos que ahi funcionan

## Uso responsable
- No se compartieron contraseñas con la IA
- Antes de cada commit se revisó con `git status` que no se subieran archivos sensibles
- Las afirmaciones sobre compatibilidad se contrastaron con documentación oficial de Expo, Prisma y Node.js