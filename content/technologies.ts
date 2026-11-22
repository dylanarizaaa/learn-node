/** Tecnologías que enseña la plataforma, con su papel y cuándo usarlas. */
export interface Technology {
  name: string;
  role: string;
  when: string;
  href: string;
  version?: string;
}

export const technologies: Technology[] = [
  {
    name: 'Node.js',
    role: 'Entorno de ejecución',
    when: 'Siempre: ejecuta JavaScript fuera del navegador con acceso a archivos, red y procesos.',
    href: '/docs/introduccion/que-es-node',
    version: '26 LTS',
  },
  {
    name: 'npm',
    role: 'Paquetes y scripts',
    when: 'En todo proyecto: instala dependencias, fija versiones con el lockfile y define los comandos del equipo.',
    href: '/docs/nucleo/npm-y-package-json',
    version: '11',
  },
  {
    name: 'Módulos ES',
    role: 'Organización del código',
    when: 'Siempre en proyectos nuevos: import/export estándar, el mismo sistema que en el navegador.',
    href: '/docs/nucleo/modulos',
  },
  {
    name: 'node:test',
    role: 'Testing',
    when: 'Para tests unitarios y de integración, mocks y cobertura sin instalar nada.',
    href: '/docs/calidad/test-runner',
  },
  {
    name: 'Express',
    role: 'Framework HTTP',
    when: 'Cuando tu API pasa de un par de rutas: routers, middleware y manejo de errores asíncronos.',
    href: '/docs/express/introduccion-a-express',
    version: '5',
  },
  {
    name: 'Zod',
    role: 'Validación de datos',
    when: 'En cada frontera: cuerpo de las peticiones, query strings, variables de entorno y archivos externos.',
    href: '/docs/express/validacion-con-zod',
    version: '4',
  },
  {
    name: 'SQLite (node:sqlite)',
    role: 'Base de datos integrada',
    when: 'Para aprender SQL, prototipos, CLIs y apps de un solo servidor: sin instalar ni administrar nada.',
    href: '/docs/datos/node-sqlite',
  },
  {
    name: 'PostgreSQL',
    role: 'Base de datos en producción',
    when: 'Cuando varias instancias comparten datos o necesitas concurrencia alta, réplicas y copias gestionadas.',
    href: '/docs/datos/postgresql-y-orms',
  },
  {
    name: 'jose',
    role: 'JWT',
    when: 'Para emitir y verificar tokens de acceso con algoritmos seguros y sin dependencias.',
    href: '/docs/seguridad/jwt',
    version: '6',
  },
  {
    name: 'pino',
    role: 'Logs estructurados',
    when: 'En cualquier servicio: logs JSON rápidos, con niveles y contexto por petición.',
    href: '/docs/calidad/logging',
    version: '10',
  },
  {
    name: 'Worker threads',
    role: 'Trabajo de CPU',
    when: 'Cuando un cálculo pesado bloquearía el event loop: informes, compresión, procesado de imágenes.',
    href: '/docs/avanzado/worker-threads',
  },
  {
    name: 'Docker',
    role: 'Empaquetado y despliegue',
    when: 'Para ejecutar la misma imagen en tu máquina, en CI y en producción.',
    href: '/docs/produccion/docker',
  },
];
