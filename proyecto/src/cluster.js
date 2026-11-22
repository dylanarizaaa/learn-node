import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';

// Un proceso de Node usa un solo núcleo para JavaScript. El módulo cluster arranca
// varias copias del servidor que comparten el mismo puerto: el proceso principal
// reparte las conexiones entre ellas.
if (cluster.isPrimary) {
  const count = Number(process.env.WORKERS) || availableParallelism();
  let shuttingDown = false;

  console.log(`Proceso principal ${process.pid}: arrancando ${count} workers`);
  for (let i = 0; i < count; i++) cluster.fork();

  // Si un worker muere de forma inesperada, lo reemplazamos.
  cluster.on('exit', (worker, code, signal) => {
    if (shuttingDown) return;
    console.warn(`Worker ${worker.process.pid} terminó (${signal ?? code}); arrancando otro`);
    cluster.fork();
  });

  // Reenviamos la señal a los workers: cada uno hace su apagado ordenado.
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => {
      shuttingDown = true;
      for (const worker of Object.values(cluster.workers ?? {})) worker?.kill(signal);
    });
  }
} else {
  // Cada worker ejecuta el servidor normal.
  await import('./server.js');
}
