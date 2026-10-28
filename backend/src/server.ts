import express from 'express';

const app = express();
const PUERTO = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', app: 'DynaMD API' });
});

app.listen(PUERTO, '0.0.0.0', () => {
  console.log(`API de DynaMD escuchando en http://localhost:${PUERTO}`);
});