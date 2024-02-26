import { WebSocketServer } from 'ws';
import { readFile } from 'node:fs/promises';
import { httpServer } from './http_server/index.js';
import { showMessage, generateID, handleAuth, sendWsMessage } from './utils.js';

const handleWebsocket = async () => {};

export default handleWebsocket;
