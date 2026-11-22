// La página es estática: el navegador pide /api/health con fetch y muestra el resultado.
const status = document.querySelector('#status');

try {
  const response = await fetch('/api/health');
  const health = await response.json();
  const version = health.version ? ` · versión ${health.version}` : '';
  status.textContent = `${health.status}${version} · ${health.uptime} s en marcha`;
  status.className = 'ok';
} catch {
  status.textContent = 'sin conexión';
  status.className = 'error';
}
