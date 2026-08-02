import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { render } = await import(path.join(root, 'dist-ssr/entry-server.js'));

const html = render();
const indexPath = path.join(root, 'dist/index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const injected = indexHtml.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

if (injected === indexHtml) {
  throw new Error('prerender: <div id="root"></div> not found in dist/index.html - build output shape changed');
}

fs.writeFileSync(indexPath, injected);
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
