let store = {
  workingInfo: {},
  userSet: [],
  dateSet: [],
  userSetName: "",
  dateSetName: "",
};

const getJson = (fileName) => {
  return store[fileName];
};

const updateJson = (fileName, data) => {
  store[fileName] = data;
  return getJson(fileName);
};

const insertLog = async (fileName, data) => {
  let log = (await getJson(fileName)) || [];
  log.push(data);
  return updateJson(fileName, log);
};

const getLog = async (fileName) => {
  let errorLog = await getJson(fileName);
  let data = errorLog.reverse();
  return data;
};

const insertJson = async (fileName, data) => {
  let log = await getJson(fileName);
  let newData = [...log, ...data];
  return updateJson(fileName, newData);
};

module.exports = { getJson, updateJson, insertLog, getLog, insertJson };
