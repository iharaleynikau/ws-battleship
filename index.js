import handleWebsockets from './src/handleWebsockets.js';
import { httpServer } from './src/http_server/index.js';
import { showMessage } from './src/utils.js';

handleWebsockets();

const HTTP_PORT = 3000;

httpServer.listen(HTTP_PORT, () => showMessage(`Start static http server on the ${HTTP_PORT} port!\n`));
