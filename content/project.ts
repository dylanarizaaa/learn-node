import type { Milestone } from '@/lib/content/types';

/** Datos del proyecto guía que crece a lo largo de toda la documentación. */
export const project = {
  name: 'Monedero',
  tagline: 'API y CLI de gastos personales',
  /** Carpeta del repositorio con el código final y probado. */
  folder: 'proyecto',
  roadmapUrl: '/docs/monedero/hoja-de-ruta',
};

/**
 * Hitos del proyecto. Cada lección declara en su frontmatter `milestone: N`
 * y termina con un bloque <ProjectStep> que aplica lo aprendido a Monedero.
 */
export const milestones: Milestone[] = [
  {
    number: 1,
    title: 'El dominio en JavaScript',
    description: 'Las reglas del negocio como funciones puras: dinero en céntimos, categorías, resúmenes y errores propios.',
    outcome: 'src/lib/money.js y src/domain/expenses.js funcionan y se pueden probar desde la terminal.',
  },
  {
    number: 2,
    title: 'La CLI',
    description:
      'Un programa de terminal con módulos, npm, argumentos, variables de entorno, archivos JSON y eventos.',
    outcome: 'node bin/monedero.js add 12,50 comida guarda gastos en data/gastos.json y los resume por categoría.',
  },
  {
    number: 3,
    title: 'Datos en flujo',
    description: 'Buffers, streams y el event loop aplicados a importar y exportar CSV de cualquier tamaño.',
    outcome: 'La CLI importa y exporta CSV con streams, sin cargar el archivo entero en memoria.',
  },
  {
    number: 4,
    title: 'Servidor HTTP',
    description: 'Una API JSON hecha solo con node:http: rutas, cuerpo de la petición, archivos estáticos y fetch.',
    outcome: 'GET y POST /api/expenses funcionan con curl y con un script de humo escrito con fetch.',
  },
  {
    number: 5,
    title: 'API con Express',
    description: 'Migramos a Express 5: routers, middleware, validación con Zod, errores centralizados y capas.',
    outcome: 'Una API REST completa (CRUD y resumen) organizada en rutas, servicio y repositorio.',
  },
  {
    number: 6,
    title: 'Base de datos',
    description: 'Cambiamos el archivo JSON por SQLite con node:sqlite, migraciones, consultas y transacciones.',
    outcome: 'Los datos viven en SQLite; filtros, paginación y totales los calcula la base de datos.',
  },
  {
    number: 7,
    title: 'Usuarios y seguridad',
    description: 'Contraseñas con scrypt, JWT, rutas protegidas, límite de peticiones y cabeceras de seguridad.',
    outcome: 'Cada persona tiene su cuenta y solo ve sus gastos; la API resiste los ataques más comunes.',
  },
  {
    number: 8,
    title: 'Calidad',
    description: 'Tests unitarios y de integración con node:test, mocks, cobertura, logs estructurados y depuración.',
    outcome: 'npm test valida toda la API en pocos segundos y los logs cuentan qué pasó en cada petición.',
  },
  {
    number: 9,
    title: 'Node avanzado',
    description: 'Tiempo real con SSE, worker threads, procesos hijos, cluster, AsyncLocalStorage y rendimiento.',
    outcome: 'Eventos en vivo, informes en segundo plano y el servidor aprovechando todos los núcleos.',
  },
  {
    number: 10,
    title: 'Producción',
    description: 'Configuración validada, apagado ordenado, Docker, despliegue, observabilidad e integración continua.',
    outcome: 'Monedero se construye, se prueba y se despliega automáticamente en un contenedor.',
  },
];

export function getMilestone(number: number | undefined) {
  return number === undefined ? undefined : milestones.find((m) => m.number === number);
}
