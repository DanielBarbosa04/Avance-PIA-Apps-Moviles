// Campos del usuario que SÍ se pueden enviar a la app (nunca contrasenaHash).
export const seleccionPublica = {
  id: true,
  correo: true,
  apodo: true,
  sexo: true,
  pesoKg: true,
  creadoEn: true,
} as const;

interface UsuarioConPeso {
  id: number;
  correo: string;
  apodo: string;
  sexo: string;
  pesoKg: { toString(): string } | number;
  creadoEn: Date;
}

// Prisma devuelve Decimal; se convierte a número para el JSON.
export function aPublico(u: UsuarioConPeso) {
  return {
    id: u.id,
    correo: u.correo,
    apodo: u.apodo,
    sexo: u.sexo,
    pesoKg: Number(u.pesoKg.toString()),
    creadoEn: u.creadoEn,
  };
}
