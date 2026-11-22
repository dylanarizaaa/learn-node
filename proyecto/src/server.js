import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db/database.js';
import { migrate } from './db/migrate.js';
import { createLogger } from './lib/logger.js';

// Punto de entrada: aquí (y solo aquí) se leen variables de entorno, se abren
// conexiones y se escucha en un puerto. Todo lo demás recibe sus dependencias.
const config = loadConfig();
const logger = createLogger({ level: config.LOG_LEVEL, pretty: config.NODE_ENV === 'development' });

const db = openDatabase(config.DATABASE_PATH);
migrate(db, { log: (message) => logger.info(message) });

const events = new EventEmitter();
const app = createApp({ config, db, logger, events });
const server = createServer(app);

server.on('error', (error) => {
  logger.fatal({ err: error }, `No se pudo escuchar en el puerto ${config.PORT}`);
  process.exit(1);
});

server.listen(config.PORT, () => {
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  logger.info(`Monedero escuchando en http://localhost:${port} (pid ${process.pid})`);
});

// ---- Apagado ordenado ----
// Al recibir SIGTERM (Docker, Kubernetes, systemd) o SIGINT (Ctrl+C) dejamos de
// aceptar conexiones, terminamos las peticiones en curso y cerramos la base de datos.
let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Cerrando el servidor…');

  events.emit('shutdown'); // cierra las conexiones SSE abiertas
  server.close((error) => {
    db.close();
    logger.info('Servidor cerrado');
    process.exitCode = error ? 1 : 0;
  });
  server.closeIdleConnections();

  // Red de seguridad: si algo no termina en 10 s, salimos igualmente.
  setTimeout(() => {
    logger.error('El cierre tardó demasiado: forzando la salida');
    process.exit(1);
  }, 10_000).unref();
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

// Un error que nadie capturó deja el proceso en un estado desconocido:
// lo registramos y salimos para que el orquestador lo reinicie limpio.
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Excepción no capturada');
  process.exit(1);
});
