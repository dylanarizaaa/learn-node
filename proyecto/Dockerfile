# syntax=docker/dockerfile:1

# Imagen oficial de Node 26 LTS en su variante reducida (Debian slim).
FROM node:26-slim

WORKDIR /app
ENV NODE_ENV=production

# 1. Primero solo los manifiestos: si no cambian, Docker reutiliza la capa
#    con las dependencias ya instaladas y el build tarda segundos.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2. Después, el código.
COPY . .

# 3. Nunca como root: la imagen trae el usuario "node".
RUN mkdir -p data && chown node:node data
USER node

EXPOSE 3000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://localhost:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

# Node directamente (no "npm start") para que reciba SIGTERM y cierre ordenadamente.
CMD ["node", "src/server.js"]
