import { highlight, LANG_LABELS, normalizeLang } from '@/lib/mdx/highlight';
import { CodeBlockFrame } from './code-block-frame';

export interface CodeBlockProps {
  code: string;
  lang?: string;
  meta?: string;
  title?: string;
  collapse?: string;
  noLineNumbers?: string;
  embedded?: boolean;
}

const TERMINAL_LANGS = ['bash', 'shell', 'sh', 'shellsession'];
const AUTO_COLLAPSE_LINES = 32;

/** Bloque de código resaltado en el servidor con Shiki. */
export async function CodeBlock({ code, lang, meta, title, collapse, noLineNumbers, embedded }: CodeBlockProps) {
  const normalized = normalizeLang(lang);
  const source = code.replace(/\n+$/, '');
  const html = await highlight(source, normalized, meta);
  const terminal = TERMINAL_LANGS.includes(normalized);
  const lineCount = source.split('\n').length;
  // En una sesión de terminal (```console) se copian solo los comandos, sin la salida.
  const copyValue =
    normalized === 'shellsession'
      ? source
          .split('\n')
          .filter((line) => line.startsWith('$ '))
          .map((line) => line.slice(2))
          .join('\n')
      : source;

  return (
    <CodeBlockFrame
      html={html}
      code={copyValue}
      language={LANG_LABELS[normalized] ?? lang ?? 'Texto'}
      title={title}
      lineNumbers={!noLineNumbers && !terminal && normalized !== 'text'}
      collapsible={collapse === 'true' || lineCount > AUTO_COLLAPSE_LINES}
      lineCount={lineCount}
      terminal={terminal}
      embedded={embedded}
    />
  );
}
