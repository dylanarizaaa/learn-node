# Monedero

API REST y CLI de gastos personales. Es el **proyecto guía de Nodo**: cada lección de la documentación añade una pieza, y esta carpeta contiene el resultado final, probado y funcionando.

- **Node.js 22.18 o superior** (recomendado: Node 26 LTS). Sin compilación: JavaScript con módulos ES.
- **Base de datos:** SQLite con el módulo integrado `node:sqlite` (no hay que instalar nada).
- **Dependencias:** Express 5, Zod 4, jose (JWT), pino (logs) y helmet (cabeceras de seguridad).

## Puesta en marcha

```bash
npm install
cp .env.example .env      # y cambia JWT_SECRET
npm run dev               # http://localhost:3000 (se reinicia al guardar)
npm test                  # tests unitarios y de integración
```

## Probar la API

```bash
# 1. Crear una cuenta (devuelve un token)
curl -X POST localhost:3000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"ana@example.com","password":"contraseña-segura"}'

# 2. Registrar un gasto
curl -X POST localhost:3000/api/expenses \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"amount":"12,50","category":"comida","description":"Almuerzo"}'

# 3. Resumen del mes
curl localhost:3000/api/expenses/summary -H "authorization: Bearer $TOKEN"
```

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` · `/api/ready` | Estado del proceso y de la base de datos |
| POST | `/api/auth/register` · `/api/auth/login` | Crear cuenta e iniciar sesión (devuelven un JWT) |
| GET | `/api/auth/me` | Usuario actual |
| GET · POST | `/api/expenses` | Listar (filtros `month`, `category`, `limit`, `offset`) y crear |
| GET · PATCH · DELETE | `/api/expenses/:id` | Leer, actualizar y borrar |
| GET | `/api/expenses/summary?month=AAAA-MM` | Totales por categoría |
| POST | `/api/expenses/import` | Importar CSV (`Content-Type: text/csv`) |
| GET | `/api/expenses/export.csv?month=AAAA-MM` | Exportar CSV en streaming |
| GET | `/api/reports/:year` | Informe anual (calculado en un worker thread) |
| GET | `/api/events` | Eventos en tiempo real (Server-Sent Events) |

## CLI

```bash
npm run cli -- add 12,50 comida "Almuerzo"
npm run cli -- list --month 2026-11
npm run cli -- summary
npm run cli -- import gastos.csv
npm run cli -- export > noviembre.csv
```

La CLI usa el usuario de `MONEDERO_USER` (o `--user <email>`), que debe existir.

## Estructura

```
bin/monedero.js        CLI
src/
  server.js            punto de entrada: config, base de datos, HTTP y apagado ordenado
  cluster.js           varios procesos compartiendo el puerto
  app.js               composición de la app Express
  config.js            variables de entorno validadas con Zod
  db/                  conexión SQLite, transacciones y migraciones .sql
  domain/              reglas puras del dominio (sin E/S)
  expenses/            schema → rutas → servicio → repositorio
  users/               contraseñas (scrypt), JWT, registro y login
  middleware/          autenticación, límite de peticiones, contexto y errores
  csv/                 parser y generador CSV con streams
  reports/             informe anual en un worker thread
  events/sse.js        tiempo real con Server-Sent Events
test/                  node:test: unitarios e integración por HTTP
```

## Docker

```bash
docker build -t monedero .
docker run -p 3000:3000 -e JWT_SECRET=... -v monedero-data:/app/data monedero
```
