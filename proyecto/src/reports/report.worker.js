// Este archivo se ejecuta en un hilo aparte (worker thread), con su propio event loop.
// Recibe los datos en `workerData`, calcula y devuelve el resultado con postMessage.
import { parentPort, workerData } from 'node:worker_threads';
import { buildYearlyReport } from './yearly-report.js';

const { year, expenses } = workerData;
parentPort?.postMessage(buildYearlyReport(year, expenses));
