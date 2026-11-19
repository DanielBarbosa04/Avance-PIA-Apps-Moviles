// Error esperado de la aplicación: lleva el código HTTP y un código estable
// que la app móvil puede usar para decidir qué mostrar.
export class ErrorApp extends Error {
  constructor(
    public readonly estado: number,
    public readonly codigo: string,
    mensaje: string,
    public readonly detalles?: unknown,
  ) {
    super(mensaje);
    this.name = 'ErrorApp';
  }
}
