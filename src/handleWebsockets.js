import { WebSocketServer } from 'ws';
import { readFile } from 'node:fs/promises';
import { httpServer } from './http_server/index.js';
import { showMessage, generateID, handleAuth, sendWsMessage } from './utils.js';

const handleWebsocket = async () => {
  const wsServer = new WebSocketServer({ server: httpServer });
  const dataBase = JSON.parse(await readFile(new URL('../db/db.json', import.meta.url)));
  let readyPlayersData = [];

  wsServer.on('connection', ws => {
    showMessage('Client has connected.');

    const randomId = generateID();

    let currentUserData;

    ws.onclose = () => {
      showMessage('Client has disconnected.');
    };

    ws.on('message', message => {
      const request = JSON.parse(message);

      showMessage(`Request ${JSON.stringify(request)}`);

      switch (request.type) {
        case 'reg':
          currentUserData = JSON.parse(request.data);

          currentUserData.id = randomId;

          ws.clientId = currentUserData.id;

          const authType = handleAuth(currentUserData, dataBase);

          const updateRoom = sendWsMessage('update_room', dataBase.rooms);

          switch (authType.type) {
            case 'reg':
              dataBase.users.push({
                name: currentUserData.name,
                password: currentUserData.password,
                id: currentUserData.id
              });

              dataBase.winners.push({ name: currentUserData.name, wins: 0 });

              ws.send(
                sendWsMessage('reg', {
                  name: currentUserData.name,
                  index: currentUserData.id,
                  error: false,
                  errorText: ''
                })
              );

              wsServer.clients.forEach(client => {
                client.send(sendWsMessage('update_winners', dataBase.winners));
              });

              ws.send(updateRoom);
              showMessage(authType.message);
              break;

            case 'login':
              ws.send(wsSendAuth);
              ws.send(updateRoom);
              showMessage(authType.message);
              break;

            default:
              ws.send(
                sendWsMessage('reg', {
                  name: '',
                  index: 0,
                  error: true,
                  errorText: authType.message
                })
              );
              showMessage(authType.message);
              break;
          }
          break;

        case 'create_room':
          if (dataBase.rooms.find(room => room.roomId === currentUserData.id)) {
            return;
          }

          dataBase.rooms.push({
            roomId: currentUserData.id,
            roomUsers: [
              {
                name: currentUserData.name,
                index: currentUserData.id
              }
            ]
          });

          wsServer.clients.forEach(client => {
            client.send(sendWsMessage('update_room', dataBase.rooms));
          });

          showMessage('Room has been created.');
          break;

        case 'add_user_to_room':
          const roomIndex = JSON.parse(request.data).indexRoom;
          let currentRoom;

          const usersIdInRoom = [];

          dataBase.rooms.find(room => {
            if (room.roomId === roomIndex) {
              currentRoom = room;
              if (room.roomUsers[0].index === currentUserData.id) return;

              room.roomUsers.push({
                name: currentUserData.name,
                index: currentUserData.id
              });

              ws.send('update_room', dataBase.rooms);

              room.roomUsers.forEach(user => usersIdInRoom.push(user.index));
            }
          });

          usersIdInRoom.forEach(id => {
            for (const client of wsServer.clients) {
              if (client.clientId === id) {
                client.send(
                  sendWsMessage('create_game', {
                    idGame: 0,
                    idPlayer: id
                  })
                );
              }
            }
          });

          dataBase.rooms = dataBase.rooms.filter(room => room !== currentRoom);

          wsServer.clients.forEach(client => {
            client.send(sendWsMessage('update_room', dataBase.rooms));
          });

          showMessage(
            `User ${currentUserData.name} has joined the ${currentRoom.roomUsers[0].name}'s room. Room has been removed.`
          );

          break;

        case 'add_ships':
          const playerData = JSON.parse(request.data);

          readyPlayersData.push(playerData);

          if (readyPlayersData.length === 2) {
            readyPlayersData.forEach(playerData => {
              for (const client of wsServer.clients) {
                if (client.clientId === playerData.indexPlayer) {
                  client.send(sendWsMessage('start_game', playerData));
                }
              }
            });

            readyPlayersData = [];
            showMessage(`The battle has begun!`);
          }
          break;

        default:
          break;
      }
    });
  });
};

export default handleWebsocket;
