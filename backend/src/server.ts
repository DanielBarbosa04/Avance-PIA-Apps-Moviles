import { crearApp } from './app';
import { leerConfiguracion } from './utils/configuracion';
import { crearPrisma } from './utils/prisma';

const config = leerConfiguracion();
const app = crearApp(crearPrisma(config), config);

app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`API de DynaMD escuchando en http://localhost:${config.PORT}`);
});
