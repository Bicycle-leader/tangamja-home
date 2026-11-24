import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname } from 'node:path';
import './build.mjs';

const root = new URL('../dist/', import.meta.url);
const port = Number(process.argv[2] ?? 4173);
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');
  const path = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const contentType = contentTypes.get(extname(path));

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  if (contentType && /^\/(?:[a-z0-9-]+\/)?[a-z0-9-]+\.(?:html|css|js|svg)$/.test(path)) {
    try {
      const body = await readFile(new URL(path.slice(1), root));
      response.writeHead(200, { 'Content-Type': contentType, 'Content-Length': body.length });
      response.end(request.method === 'GET' ? body : undefined);
      return;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        response.writeHead(500).end();
        return;
      }
    }
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('페이지를 찾을 수 없습니다.');
}).listen(port, '127.0.0.1', () => {
  console.log(`Local: http://127.0.0.1:${port}/`);
});
