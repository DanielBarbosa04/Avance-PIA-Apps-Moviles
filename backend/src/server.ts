import express from 'express';
import { prisma } from './utils/prisma';

const app = express();
const PUERTO = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', app: 'DynaMD API' });
});

// Ruta de prueba temporal confirma que laAPI llega a mysql de verdad
app.get('/api/salud/bd', async (_req, res) => {
  try {
    const usuarios = await prisma.usuario.count();
    res.json({ estado: 'ok', usuarios });
  } catch (error) {
    console.error('Error de base de datos:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'No se pudo consultar la base de datos',
    });
  }
});

app.listen(PUERTO, '0.0.0.0', () => {
  console.log(`API de DynaMD escuchando en http://localhost:${PUERTO}`);
});