import { z } from 'zod';

const esquema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'debe tener al menos 32 caracteres'),
  LIMITE_AUTH_15MIN: z.coerce.number().int().min(1).default(20),
});

export type Configuracion = z.infer<typeof esquema>;

// Valida las variables de entorno al arrancar. Si falta algo, el servidor
// no inicia y el mensaje dice qué variable corregir (sin mostrar valores).
export function leerConfiguracion(
  env: NodeJS.ProcessEnv = process.env,
): Configuracion {
  const resultado = esquema.safeParse(env);
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((p) => `- ${p.path.join('.')}: ${p.message}`)
      .join('\n');
    throw new Error(`Configuración inválida en backend/.env:\n${problemas}`);
  }
  return resultado.data;
}
