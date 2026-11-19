// Geometría del mapa muscular (SVG). Sin dependencias de React: solo calcula
// los contornos. Todo se dibuja en un lienzo de 200 x 420 con el eje del
// cuerpo en x = 100. Cada región se define para el lado izquierdo y se
// refleja para el derecho. La anatomía femenina se obtiene deformando el
// ancho (hombros más angostos, cadera más ancha); es una figura estilizada,
// no un atlas anatómico.
import type { GrupoId } from '@/datos/grupos-musculares';

export type Sexo = 'MASCULINO' | 'FEMENINO';
export type Vista = 'frente' | 'espalda';
type Punto = [number, number];

export interface RegionMapa {
  grupo: GrupoId;
  d: string;
}
export interface MapaCuerpo {
  silueta: string[];
  cabeza: { cx: number; cy: number; r: number };
  regiones: RegionMapa[];
}

export const LIENZO = { ancho: 200, alto: 420 } as const;
const EJE = 100;

// ---------- Silueta (lado izquierdo) ----------
const TRONCO_Y_PIERNA: Punto[] = [
  [100, 50], [91, 52], [90, 64], [78, 70], [62, 75], [58, 84], [60, 108],
  [64, 140], [70, 185], [66, 215], [63, 235], [62, 250], [64, 280], [69, 312],
  [68, 335], [71, 360], [77, 392], [74, 408], [91, 412], [90, 392],
  [92, 360], [94, 335], [95, 312], [95, 280], [97, 258], [100, 240],
];

const BRAZO: Punto[] = [
  [56, 75], [46, 82], [41, 112], [37, 150], [31, 190], [29, 214], [25, 240],
  [33, 250], [39, 240], [40, 214], [45, 186], [49, 152], [55, 118], [59, 98],
];

// ---------- Regiones musculares (lado izquierdo) ----------
const FRENTE: Partial<Record<GrupoId, Punto[]>> = {
  pecho: [[98, 84], [82, 80], [66, 85], [61, 98], [66, 112], [82, 119], [98, 115]],
  hombros: [[60, 78], [52, 78], [45, 87], [43, 102], [49, 111], [57, 104], [61, 90]],
  biceps: [[52, 114], [45, 116], [42, 138], [44, 152], [51, 150], [55, 132]],
  antebrazos: [[44, 157], [37, 158], [32, 186], [30, 208], [38, 208], [43, 184], [46, 168]],
  abdomen: [[98, 123], [84, 125], [76, 142], [72, 168], [74, 190], [86, 202], [98, 206]],
  cuadriceps: [[96, 246], [82, 240], [69, 252], [67, 280], [72, 306], [82, 311], [92, 305], [95, 278]],
};

const ESPALDA: Partial<Record<GrupoId, Punto[]>> = {
  'espalda-alta': [[98, 58], [88, 61], [74, 71], [65, 82], [70, 94], [84, 102], [98, 104]],
  hombros: [[60, 78], [52, 78], [45, 87], [43, 102], [49, 110], [57, 102], [61, 90]],
  triceps: [[52, 114], [45, 116], [42, 138], [44, 152], [51, 150], [55, 132]],
  antebrazos: [[44, 157], [37, 158], [32, 186], [30, 208], [38, 208], [43, 184], [46, 168]],
  dorsales: [[98, 108], [84, 106], [70, 101], [64, 108], [64, 126], [68, 150], [78, 170], [90, 176], [98, 174]],
  'espalda-baja': [[98, 180], [88, 180], [79, 176], [73, 190], [75, 206], [86, 213], [98, 213]],
  gluteos: [[98, 218], [86, 216], [70, 224], [65, 240], [70, 257], [86, 262], [98, 256]],
  femoral: [[96, 266], [84, 268], [68, 266], [66, 288], [70, 311], [81, 314], [91, 310], [95, 290]],
  pantorrillas: [[92, 322], [81, 320], [72, 330], [70, 348], [75, 366], [83, 372], [90, 360], [94, 340]],
};

// ---------- Deformación femenina ----------
const ANCHO_FEMENINO: Punto[] = [
  [0, 1], [60, 0.96], [78, 0.88], [110, 0.9], [150, 0.92], [190, 0.9],
  [225, 1.1], [260, 1.1], [312, 1.02], [372, 0.97], [420, 0.95],
];

function factor(y: number): number {
  const t = ANCHO_FEMENINO;
  if (y <= t[0]![0]) return t[0]![1];
  for (let i = 1; i < t.length; i++) {
    const [y1, f1] = t[i]!;
    const [y0, f0] = t[i - 1]!;
    if (y <= y1) return f0 + ((f1 - f0) * (y - y0)) / (y1 - y0);
  }
  return t[t.length - 1]![1];
}

// Los brazos (x <= 61, por encima de la cadera) no siguen el ensanche de la cadera.
const deformar = (p: Punto, sexo: Sexo): Punto => {
  if (sexo !== 'FEMENINO') return p;
  const f = p[0] <= 61 && p[1] <= 255 ? 0.9 : factor(p[1]);
  return [EJE + (p[0] - EJE) * f, p[1]];
};

const reflejar = (p: Punto): Punto => [2 * EJE - p[0], p[1]];
const n = (v: number) => Math.round(v * 10) / 10;

// Curva suave cerrada (Catmull-Rom convertida a Bézier cúbica).
function curvaCerrada(pts: Punto[]): string {
  const k = pts.length;
  let d = `M${n(pts[0]![0])} ${n(pts[0]![1])}`;
  for (let i = 0; i < k; i++) {
    const p0 = pts[(i - 1 + k) % k]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % k]!;
    const p3 = pts[(i + 2) % k]!;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0]!)} ${n(c1[1]!)} ${n(c2[0]!)} ${n(c2[1]!)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return `${d}Z`;
}

// Región simétrica: subtrazado izquierdo + subtrazado derecho (un solo Path).
function simetrica(pts: Punto[], sexo: Sexo): string {
  const izq = pts.map((p) => deformar(p, sexo));
  return `${curvaCerrada(izq)}${curvaCerrada(izq.map(reflejar))}`;
}

// Silueta de una pieza que cruza el eje: mitad izquierda + mitad derecha reflejada.
function entera(mitad: Punto[], sexo: Sexo): string {
  const izq = mitad.map((p) => deformar(p, sexo));
  const der = [...izq].reverse().map(reflejar);
  // El primer y último punto de la mitad están sobre el eje: se omiten en el reflejo.
  const completa = [...izq, ...der.slice(1, -1)];
  return curvaCerrada(completa);
}

const cache = new Map<string, MapaCuerpo>();

export function construirMapa(sexo: Sexo, vista: Vista): MapaCuerpo {
  const clave = `${sexo}-${vista}`;
  const guardado = cache.get(clave);
  if (guardado) return guardado;

  const origen = vista === 'frente' ? FRENTE : ESPALDA;
  const regiones: RegionMapa[] = (Object.keys(origen) as GrupoId[]).map((grupo) => ({
    grupo,
    d: simetrica(origen[grupo]!, sexo),
  }));

  const mapa: MapaCuerpo = {
    silueta: [entera(TRONCO_Y_PIERNA, sexo), simetrica(BRAZO, sexo)],
    cabeza: { cx: EJE, cy: 30, r: sexo === 'FEMENINO' ? 18 : 19 },
    regiones,
  };
  cache.set(clave, mapa);
  return mapa;
}

// Grupos que se pueden tocar en cada vista.
export function gruposDeVista(vista: Vista): GrupoId[] {
  return Object.keys(vista === 'frente' ? FRENTE : ESPALDA) as GrupoId[];
}
