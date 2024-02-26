import { httpServer } from './src/http_server/index.js';

const HTTP_PORT = 3000;

httpServer.listen(HTTP_PORT, () => console.log(`Start static http server on the ${HTTP_PORT} port!\n`));
