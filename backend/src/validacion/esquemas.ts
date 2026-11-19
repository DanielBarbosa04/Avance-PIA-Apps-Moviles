import { z } from 'zod';

const correo = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Correo inválido').max(254));

const apodo = z.string().trim().min(2).max(30);

const pesoKg = z
  .number('Peso inválido')
  .min(20, 'Peso demasiado bajo')
  .max(400, 'Peso demasiado alto')
  .transform((n) => Math.round(n * 100) / 100);

export const esquemaRegistro = z.object({
  correo,
  contrasena: z.string().min(10, 'Mínimo 10 caracteres').max(128),
  apodo,
  sexo: z.enum(['MASCULINO', 'FEMENINO']),
  pesoKg,
});

export const esquemaLogin = z.object({
  correo,
  contrasena: z.string().min(1).max(128),
});

export const esquemaActualizarPerfil = z
  .strictObject({ apodo: apodo.optional(), pesoKg: pesoKg.optional() })
  .refine((d) => d.apodo !== undefined || d.pesoKg !== undefined, {
    message: 'Envía al menos un campo para actualizar',
  });
