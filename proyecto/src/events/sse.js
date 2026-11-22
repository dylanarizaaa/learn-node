const EVENT_TYPES = ['expense.created', 'expense.updated', 'expense.deleted', 'expense.imported'];
const HEARTBEAT_MS = 25_000;

/**
 * Server-Sent Events: una respuesta HTTP que nunca termina y por la que el
 * servidor envía eventos al cliente en cuanto ocurren.
 *
 *   curl -N -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/events
 *
 * @param {import('node:events').EventEmitter} events
 * @returns {import('express').RequestHandler}
 */
export function sseHandler(events) {
  return (req, res) => {
    const userId = req.user.id;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(': conectado\n\n'); // las líneas que empiezan por ":" son comentarios

    // Un listener por tipo de evento; cada usuario solo recibe los suyos.
    const listeners = EVENT_TYPES.map((type) => {
      const listener = (payload) => {
        if (payload.userId !== userId) return;
        const data = payload.expense ?? { count: payload.count };
        res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      };
      events.on(type, listener);
      return [type, listener];
    });

    // Un comentario periódico evita que proxies y balanceadores corten la conexión.
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);
    const end = () => res.end();
    events.once('shutdown', end);

    // Al desconectarse el cliente, quitamos todo: si no, tendríamos una fuga de memoria.
    res.on('close', () => {
      clearInterval(heartbeat);
      events.off('shutdown', end);
      for (const [type, listener] of listeners) events.off(type, listener);
    });
  };
}
