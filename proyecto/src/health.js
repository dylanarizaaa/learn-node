import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import { promisify } from 'node:util';
import { Router } from 'express';

const execFileAsync = promisify(execFile);

// Mide continuamente cuánto se retrasa el event loop: si sube, algo lo está bloqueando.
// El histograma mide el intervalo completo entre muestras, así que restamos la resolución.
const RESOLUTION_MS = 20;
const loopDelay = monitorEventLoopDelay({ resolution: RESOLUTION_MS });
loopDelay.enable();

/**
 * Versión desplegada: el commit de git si está disponible (child_process),
 * o la versión de package.json si no (por ejemplo, dentro de Docker).
 */
async function detectVersion() {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: import.meta.dirname,
      timeout: 2000,
    });
    return stdout.trim();
  } catch {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    return pkg.version;
  }
}

/** @param {{ db: import('node:sqlite').DatabaseSync }} deps */
export function healthRouter({ db }) {
  const router = Router();
  const version = detectVersion();

  // Liveness: el proceso responde.
  router.get('/health', async (req, res) => {
    res.json({
      status: 'ok',
      version: await version,
      uptime: Math.round(process.uptime()),
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      eventLoopDelayMs: Number(Math.max(0, loopDelay.mean / 1e6 - RESOLUTION_MS).toFixed(2)),
    });
  });

  // Readiness: además, sus dependencias (la base de datos) funcionan.
  router.get('/ready', (req, res) => {
    try {
      db.prepare('SELECT 1').get();
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  return router;
}
