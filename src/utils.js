export const generateID = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const showMessage = message => {
  const currentTime = new Date().toLocaleTimeString();
  console.log(`${currentTime}: ${message}`);
};

export const handleAuth = (userData, dataBase) => {
  const checkIsUserExist = dataBase.users.find(element => {
    return element.name === userData.name;
  });

  if (checkIsUserExist !== undefined && userData.password !== checkIsUserExist.password) {
    return { type: 'error', message: 'Password is incorrect.' };
  } else if (checkIsUserExist !== undefined && userData.password === checkIsUserExist.password) {
    return { type: 'login', message: `${userData.name} has logged in.` };
  } else if (checkIsUserExist === undefined) {
    return { type: 'reg', message: `${userData.name} has registered.` };
  }
};

export const sendWsMessage = (type, data) => {
  return JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0
  });
};
