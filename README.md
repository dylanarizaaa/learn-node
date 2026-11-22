# Nodo — Aprende Node.js construyendo un proyecto real

Guía interactiva en español para aprender Node.js de principiante a avanzado (Node 26 LTS · Express 5 · Zod 4). Son **80 páginas** de lecciones cortas: cada una explica un concepto con un ejemplo mínimo y termina con un bloque **«Aplícalo al proyecto»** que añade lo aprendido a **Monedero**, una API y CLI de gastos personales que crece a lo largo de 10 hitos.

| Hito | Qué se añade a Monedero |
| --- | --- |
| 1. El dominio en JavaScript | Dinero en céntimos, categorías, resúmenes y errores propios |
| 2. La CLI | Módulos, npm, argumentos, `.env`, archivos JSON y eventos |
| 3. Datos en flujo | Buffers, streams y event loop: importar y exportar CSV |
| 4. Servidor HTTP | Una API solo con `node:http`, estáticos y `fetch` |
| 5. API con Express | Routers, middleware, Zod, errores centralizados y capas |
| 6. Base de datos | `node:sqlite`, migraciones, consultas y transacciones |
| 7. Usuarios y seguridad | scrypt, JWT, rutas protegidas y límite de peticiones |
| 8. Calidad | `node:test`, mocks, cobertura, logs con pino y tipos con JSDoc |
| 9. Node avanzado | SSE, worker threads, procesos hijos, cluster, AsyncLocalStorage, rendimiento y permisos |
| 10. Producción | Configuración validada, apagado ordenado, Docker, despliegue, observabilidad y CI |

Además: 6 proyectos prácticos independientes (CLI de notas, organizador de archivos, acortador de URLs, monitor de sitios, chat con WebSockets y cola de trabajos), 8 rutas de aprendizaje y un glosario de 53 términos.

## El proyecto guía: `proyecto/`

La carpeta [`proyecto/`](proyecto/) contiene Monedero terminado, con 37 tests que pasan. Las lecciones muestran el código real de esta carpeta (componente `<SourceFile>`), así que la documentación y el código no se desincronizan.

```bash
cd proyecto
npm install
cp .env.example .env    # y define JWT_SECRET (32 caracteres o más)
npm run dev             # http://localhost:3000
npm test
```

Más detalles en [`proyecto/README.md`](proyecto/README.md).

## La web de documentación

Node.js 20.9 o superior (recomendado 26).

```bash
npm install
npm run dev            # servidor de desarrollo en http://localhost:3000
npm run build          # exportación estática en out/
npm start              # sirve out/ localmente
npm run lint           # comprobación de tipos (tsc --noEmit)
npm run check:content  # valida frontmatter, enlaces, glosario, rutas, hitos y SourceFile
npm run test:proyecto  # ejecuta los tests de Monedero
```

El sitio se exporta como HTML estático (`output: 'export'`), así que se puede publicar en cualquier hosting estático. El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) prueba Monedero en Node 22, 24 y 26, construye su imagen Docker y compila la documentación.

## Estructura

```
app/                    # rutas (Next.js App Router)
components/
  docs/                 # sidebar, TOC, cabecera del tema, paginación
  mdx/                  # componentes MDX (CodeBlock, Steps, Flow, ProjectStep, SourceFile, Endpoint, Roadmap…)
  search/               # buscador (⌘K o /) con MiniSearch
  learning/             # progreso, favoritos, historial, rutas
content/
  navigation.ts         # secciones y orden de las lecciones
  project.ts            # los 10 hitos de Monedero
  docs/<sección>/*.mdx  # contenido
  glossary.ts           # glosario técnico
  learning-paths.ts     # rutas de aprendizaje
lib/                    # carga de MDX, búsqueda, resaltado y estado local
proyecto/               # Monedero: el código final y sus tests
scripts/check-content.mts
```

## Añadir una lección

1. Crea `content/docs/<sección>/<slug>.mdx` con su frontmatter:

   ```yaml
   ---
   title: Título de la lección
   description: "Una frase. Si contiene «: » va entre comillas."
   difficulty: principiante   # principiante | intermedio | avanzado
   time: 15                   # minutos
   prerequisites: [nucleo/modulos]
   related: [express/middleware]
   resources:
     - title: Documentación oficial
       url: https://nodejs.org/docs/latest/api/
   keywords: ["palabra", "otra"]
   milestone: 3               # hito de Monedero al que contribuye
   ---
   ```

2. Termina la lección con `<ProjectStep files={['ruta/del/archivo.js']}>…</ProjectStep>`. Dentro, `<SourceFile path="src/archivo.js" lines="10-30" />` muestra código real de `proyecto/`.
3. Añade el slug en `content/navigation.ts`.
4. Ejecuta `npm run check:content`: comprueba que cada lección con `milestone` tenga su `<ProjectStep>` y que cada `<SourceFile>` exista.

Los bloques de código admiten `title="ruta/archivo.js"`, `collapse`, `noLineNumbers`, resaltado de líneas `{1,4-6}` y notaciones de Shiki (`// [!code ++]`, `// [!code focus]`). Un bloque ```` ```console ```` se muestra como sesión de terminal y el botón de copiar solo copia los comandos (`$ …`).
