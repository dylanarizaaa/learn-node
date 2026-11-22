import type { GlossaryEntry } from '@/lib/content/types';

/** Glosario técnico. Ordenado alfabéticamente al mostrarse. */
export const glossary: GlossaryEntry[] = [
  {
    slug: 'api-rest',
    term: 'API REST',
    definition:
      'Estilo de API HTTP en el que cada URL representa un recurso (/api/expenses/7) y el método indica la acción: GET lee, POST crea, PATCH modifica y DELETE borra.',
    docs: ['http/protocolo-http', 'express/rutas-y-routers'],
  },
  {
    slug: 'async-await',
    term: 'async / await',
    definition:
      'Sintaxis para trabajar con promesas como si el código fuera secuencial. Una función async siempre devuelve una promesa; await pausa esa función (no el proceso) hasta que la promesa se resuelve.',
    docs: ['javascript/async-await'],
  },
  {
    slug: 'asynclocalstorage',
    term: 'AsyncLocalStorage',
    definition:
      'API de node:async_hooks que guarda un contexto (por ejemplo, el id de la petición) accesible desde cualquier función de la cadena asíncrona, sin pasarlo como parámetro.',
    docs: ['avanzado/async-local-storage'],
  },
  {
    slug: 'backpressure',
    term: 'Backpressure',
    definition:
      'Mecanismo de los streams para que un productor rápido espere a un consumidor lento: write() devuelve false y el productor se pausa hasta el evento drain.',
    docs: ['nucleo/streams', 'avanzado/streams-avanzados'],
  },
  {
    slug: 'buffer',
    term: 'Buffer',
    definition:
      'Secuencia de bytes de tamaño fijo. Node la usa para datos binarios: archivos, sockets, criptografía. Es una subclase de Uint8Array.',
    docs: ['nucleo/buffers'],
  },
  {
    slug: 'callback',
    term: 'Callback',
    definition:
      'Función que se pasa a otra para que la llame cuando termine. En el estilo clásico de Node el primer argumento es el error: (err, resultado).',
    docs: ['javascript/callbacks'],
  },
  {
    slug: 'ci-cd',
    term: 'CI/CD',
    definition:
      'Integración y despliegue continuos: cada cambio se prueba automáticamente (CI) y, si pasa, se construye y despliega (CD).',
    docs: ['produccion/ci-cd'],
  },
  {
    slug: 'closure',
    term: 'Closure',
    definition:
      'Función que recuerda las variables del ámbito donde se creó, aunque ese ámbito ya haya terminado. Base de las fábricas de funciones y de los middleware configurables.',
    docs: ['javascript/funciones-y-closures'],
  },
  {
    slug: 'cluster',
    term: 'Cluster',
    definition:
      'Módulo que arranca varios procesos de Node que comparten el mismo puerto, para aprovechar todos los núcleos de la CPU.',
    docs: ['avanzado/cluster'],
  },
  {
    slug: 'commonjs',
    term: 'CommonJS',
    definition:
      'Sistema de módulos original de Node: require() y module.exports. Sigue soportado, pero en proyectos nuevos se usan módulos ES.',
    docs: ['nucleo/modulos'],
  },
  {
    slug: 'cors',
    term: 'CORS',
    definition:
      'Cross-Origin Resource Sharing: cabeceras con las que un servidor permite que páginas de otros orígenes lean sus respuestas desde el navegador.',
    docs: ['express/cors-y-cabeceras'],
  },
  {
    slug: 'crud',
    term: 'CRUD',
    definition: 'Create, Read, Update, Delete: las cuatro operaciones básicas sobre un recurso persistente.',
    docs: ['express/rutas-y-routers', 'datos/sql-esencial'],
  },
  {
    slug: 'docker',
    term: 'Docker',
    definition:
      'Herramienta que empaqueta una aplicación y su entorno en una imagen. Un contenedor es una instancia en ejecución de esa imagen.',
    docs: ['produccion/docker'],
  },
  {
    slug: 'esm',
    term: 'Módulos ES (ESM)',
    definition:
      'Sistema de módulos estándar de JavaScript: import y export. En Node se activa con "type": "module" en package.json o con la extensión .mjs.',
    docs: ['nucleo/modulos'],
  },
  {
    slug: 'event-emitter',
    term: 'EventEmitter',
    definition:
      'Clase de node:events que permite emitir eventos con nombre y suscribirse a ellos. Servidores, streams y procesos son EventEmitters.',
    docs: ['nucleo/eventos'],
  },
  {
    slug: 'event-loop',
    term: 'Event loop',
    definition:
      'Bucle que ejecuta el código JavaScript de Node en un solo hilo: atiende temporizadores, E/S completada y callbacks por fases, uno detrás de otro.',
    docs: ['introduccion/como-funciona-node', 'nucleo/event-loop', 'avanzado/event-loop-a-fondo'],
  },
  {
    slug: 'express',
    term: 'Express',
    definition:
      'Framework HTTP minimalista para Node: rutas, middleware y respuestas. La versión 5 propaga automáticamente los errores de funciones async.',
    docs: ['express/introduccion-a-express'],
  },
  {
    slug: 'fetch',
    term: 'fetch',
    definition:
      'API estándar para hacer peticiones HTTP, global en Node desde la versión 18. Devuelve una promesa con un objeto Response.',
    docs: ['http/fetch'],
  },
  {
    slug: 'graceful-shutdown',
    term: 'Apagado ordenado',
    definition:
      'Cerrar un servidor al recibir SIGTERM o SIGINT dejando de aceptar conexiones, terminando las peticiones en curso y cerrando recursos antes de salir.',
    docs: ['produccion/apagado-ordenado'],
  },
  {
    slug: 'hash',
    term: 'Hash de contraseña',
    definition:
      'Resultado de una función lenta y de un solo sentido (scrypt, argon2, bcrypt) aplicada a una contraseña con una sal. Se guarda el hash, nunca la contraseña.',
    docs: ['seguridad/contrasenas'],
  },
  {
    slug: 'health-check',
    term: 'Health check',
    definition:
      'Endpoint (como /api/health) que indica si el proceso está vivo y listo. Lo consultan Docker, balanceadores y orquestadores.',
    docs: ['produccion/observabilidad'],
  },
  {
    slug: 'idempotencia',
    term: 'Idempotencia',
    definition:
      'Propiedad de una operación que produce el mismo resultado si se repite. GET, PUT y DELETE son idempotentes; POST no.',
    docs: ['http/protocolo-http'],
  },
  {
    slug: 'inyeccion-sql',
    term: 'Inyección SQL',
    definition:
      'Ataque que consiste en colar SQL dentro de un dato que se concatena en una consulta. Se evita siempre con consultas parametrizadas.',
    docs: ['datos/consultas-y-paginacion', 'seguridad/seguridad-de-apis'],
  },
  {
    slug: 'jwt',
    term: 'JWT',
    definition:
      'JSON Web Token: cabecera, datos y firma codificados en base64url. El servidor verifica la firma para confiar en los datos sin consultar una sesión.',
    docs: ['seguridad/jwt'],
  },
  {
    slug: 'libuv',
    term: 'libuv',
    definition:
      'Biblioteca en C que da a Node su event loop y su E/S asíncrona, y un pool de hilos para operaciones como el sistema de archivos o scrypt.',
    docs: ['introduccion/como-funciona-node'],
  },
  {
    slug: 'lockfile',
    term: 'Lockfile',
    definition:
      'package-lock.json: registra la versión exacta de cada dependencia instalada para que todas las instalaciones sean idénticas. Se sube al repositorio.',
    docs: ['nucleo/npm-y-package-json'],
  },
  {
    slug: 'lts',
    term: 'LTS',
    definition:
      'Long Term Support: versiones de Node con soporte prolongado (unos 30 meses). Son las recomendadas para producción.',
    docs: ['introduccion/instalacion-y-versiones'],
  },
  {
    slug: 'middleware',
    term: 'Middleware',
    definition:
      'Función (req, res, next) que Express ejecuta en cadena antes de llegar a la ruta: autenticación, logs, parseo del cuerpo, límites…',
    docs: ['express/middleware'],
  },
  {
    slug: 'migracion',
    term: 'Migración',
    definition:
      'Archivo versionado que cambia el esquema de la base de datos (crear tablas, añadir columnas). Se aplican en orden y una sola vez.',
    docs: ['datos/migraciones'],
  },
  {
    slug: 'mock',
    term: 'Mock / doble de prueba',
    definition:
      'Objeto o función falsa que sustituye a una dependencia real en un test, para controlar lo que devuelve y comprobar cómo se la llamó.',
    docs: ['calidad/mocks'],
  },
  {
    slug: 'npm',
    term: 'npm',
    definition:
      'Gestor de paquetes que viene con Node: instala dependencias desde el registro público, ejecuta scripts y publica paquetes.',
    docs: ['nucleo/npm-y-package-json'],
  },
  {
    slug: 'orm',
    term: 'ORM',
    definition:
      'Object-Relational Mapper: librería que traduce entre tablas SQL y objetos del lenguaje (Prisma, Drizzle, Sequelize).',
    docs: ['datos/postgresql-y-orms'],
  },
  {
    slug: 'package-json',
    term: 'package.json',
    definition:
      'Manifiesto del proyecto: nombre, versión, tipo de módulos, scripts, dependencias y versiones de Node compatibles.',
    docs: ['nucleo/npm-y-package-json'],
  },
  {
    slug: 'paginacion',
    term: 'Paginación',
    definition:
      'Devolver una colección por partes (limit y offset, o un cursor) en lugar de todos los registros a la vez.',
    docs: ['datos/consultas-y-paginacion'],
  },
  {
    slug: 'promesa',
    term: 'Promesa',
    definition:
      'Objeto que representa un resultado futuro: pendiente, cumplida con un valor o rechazada con un error.',
    docs: ['javascript/promesas'],
  },
  {
    slug: 'proceso-hijo',
    term: 'Proceso hijo',
    definition:
      'Programa lanzado desde Node con node:child_process (spawn, execFile, fork). Tiene su propia memoria y se comunica por stdin/stdout o mensajes.',
    docs: ['avanzado/procesos-hijos'],
  },
  {
    slug: 'rate-limiting',
    term: 'Rate limiting',
    definition:
      'Limitar cuántas peticiones acepta la API de un mismo cliente en una ventana de tiempo. Frena fuerza bruta y abusos (HTTP 429).',
    docs: ['seguridad/limitar-peticiones'],
  },
  {
    slug: 'repl',
    term: 'REPL',
    definition:
      'Read-Eval-Print Loop: la consola interactiva que se abre al ejecutar node sin argumentos. Útil para probar código al instante.',
    docs: ['introduccion/tu-primer-programa'],
  },
  {
    slug: 'repositorio',
    term: 'Repositorio (patrón)',
    definition:
      'Módulo que encapsula el acceso a datos (SQL, archivos) detrás de funciones como create o findById. El resto del código no sabe dónde se guardan.',
    docs: ['express/arquitectura-por-capas', 'datos/node-sqlite'],
  },
  {
    slug: 'sal',
    term: 'Sal (salt)',
    definition:
      'Valor aleatorio que se combina con cada contraseña antes de calcular el hash, para que dos contraseñas iguales den hashes distintos.',
    docs: ['seguridad/contrasenas'],
  },
  {
    slug: 'semver',
    term: 'Semver',
    definition:
      'Versionado semántico MAYOR.MENOR.PARCHE. En package.json, ^5.3.0 acepta 5.x.y compatibles y ~5.3.0 solo parches.',
    docs: ['nucleo/npm-y-package-json'],
  },
  {
    slug: 'sse',
    term: 'Server-Sent Events (SSE)',
    definition:
      'Respuesta HTTP que no termina y por la que el servidor envía eventos de texto al cliente. Unidireccional y más simple que WebSocket.',
    docs: ['avanzado/tiempo-real'],
  },
  {
    slug: 'sqlite',
    term: 'SQLite',
    definition:
      'Base de datos SQL completa guardada en un único archivo, sin servidor. Node la incluye en el módulo node:sqlite.',
    docs: ['datos/node-sqlite'],
  },
  {
    slug: 'status-code',
    term: 'Código de estado HTTP',
    definition:
      'Número que resume el resultado de una petición: 2xx éxito, 3xx redirección, 4xx error del cliente y 5xx error del servidor.',
    docs: ['http/protocolo-http'],
  },
  {
    slug: 'stream',
    term: 'Stream',
    definition:
      'Flujo de datos que se procesa por trozos (chunks) a medida que llega. Hay streams legibles, escribibles, dúplex y de transformación.',
    docs: ['nucleo/streams', 'avanzado/streams-avanzados'],
  },
  {
    slug: 'thread-pool',
    term: 'Pool de hilos',
    definition:
      'Conjunto de hilos de libuv (4 por defecto) que ejecutan en segundo plano operaciones bloqueantes como leer archivos, DNS o scrypt.',
    docs: ['introduccion/como-funciona-node', 'avanzado/event-loop-a-fondo'],
  },
  {
    slug: 'transaccion',
    term: 'Transacción',
    definition:
      'Grupo de operaciones de base de datos que se confirma completo (COMMIT) o se deshace completo (ROLLBACK).',
    docs: ['datos/transacciones'],
  },
  {
    slug: 'type-stripping',
    term: 'Type stripping',
    definition:
      'Capacidad de Node de ejecutar archivos .ts eliminando las anotaciones de tipo, sin compilar ni comprobar los tipos.',
    docs: ['calidad/tipos-con-typescript'],
  },
  {
    slug: 'v8',
    term: 'V8',
    definition:
      'Motor de JavaScript de Google (el de Chrome). Node lo usa para compilar y ejecutar tu código y gestionar la memoria.',
    docs: ['introduccion/como-funciona-node'],
  },
  {
    slug: 'variable-de-entorno',
    term: 'Variable de entorno',
    definition:
      'Valor de configuración que el sistema operativo pasa al proceso (PORT, DATABASE_PATH). En Node se leen en process.env.',
    docs: ['nucleo/variables-de-entorno', 'produccion/configuracion'],
  },
  {
    slug: 'websocket',
    term: 'WebSocket',
    definition:
      'Protocolo de comunicación bidireccional y persistente sobre una conexión TCP, iniciado con una petición HTTP de upgrade.',
    docs: ['avanzado/tiempo-real', 'proyectos/chat-en-tiempo-real'],
  },
  {
    slug: 'worker-thread',
    term: 'Worker thread',
    definition:
      'Hilo adicional con su propio event loop y su propia instancia de V8, creado con node:worker_threads para trabajo intensivo de CPU.',
    docs: ['avanzado/worker-threads'],
  },
  {
    slug: 'zod',
    term: 'Zod',
    definition:
      'Librería para declarar esquemas de datos y validarlos en tiempo de ejecución, con mensajes de error y tipos inferidos.',
    docs: ['express/validacion-con-zod'],
  },
];
