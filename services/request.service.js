const { BASE_URL, API_END_POINT } = require("../constants");
let resStore = {};
var { Json, convertToIST, isDateGrater } = require("../utility");
var request = require("request");

const fnTemplate = async () =>
  new Promise(async (resolve, reject) => {
    try {
      return true;
      resolve("success");
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const GetData = async (END_POINT) =>
  new Promise(async (resolve, reject) => {
    try {
      request.get(
        {
          headers: { "content-type": "application/json" },
          url: BASE_URL + END_POINT,
          body: "",
          // jar: cookieJar,
        },
        async (error, response, body) => {
          if (error) {
            reject(error);
          }
          if (response.statusCode == 200 || response.statusCode == "200") {
            if (body) {
              let tempBody = JSON.parse(body);
              // console.log("body", tempBody.data);
              resolve(tempBody.data);
            } else {
              reject({ data: body, message: response });
            }
          } else {
            reject({ data: body, message: response });
          }
        }
      );
      // fetch(BASE_URL + END_POINT)
      //   .then((res) => {
      //     console.log(res.status);
      //     if (res.status === 200) {
      //       return res.json();
      //     } else {
      //       reject(res);
      //     }
      //   })
      //   .then((body) => {
      //     resolve(body.data);
      //   })
      //   .catch((e) => reject(e));
    } catch (e) {
      console.error(e);
      reject(e);
      //   throw Error("Error while stet request service startAll");
    }
  });

const CreateData = async (END_POINT, data) =>
  new Promise(async (resolve, reject) => {
    try {
      request.post(
        {
          headers: { "content-type": "application/json" },
          url: BASE_URL + END_POINT,
          body: JSON.stringify(data),
          // jar: cookieJar,
        },
        async (error, response, body) => {
          if (error) {
            reject(error);
          }
          if (response.statusCode == 200 || response.statusCode == "200") {
            if (body) {
              let tempBody = JSON.parse(body);
              // console.log("body", tempBody.data);
              resolve(tempBody.data);
            } else {
              reject({ data: body, message: response });
            }
          } else {
            reject({ data: body, message: response });
          }
        }
      );
      // fetch(BASE_URL + END_POINT, {
      //   method: "post",
      //   body: JSON.stringify(data),
      //   headers: { "Content-Type": "application/json" },
      // })
      //   .then((res) => {
      //     // console.log(res.status);
      //     if (res.status === 200) {
      //       return res.json();
      //     } else {
      //       reject(res);
      //     }
      //   })
      //   .then((body) => {
      //     resolve(body.data);
      //   })
      //   .catch((e) => reject(e));
    } catch (e) {
      console.error(e);
      reject(e);
      //   throw Error("Error while stet request service startAll");
    }
  });

const getWorkingInfo = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const userSetName = Json.getJson("userSetName") || "userSetTest";
      console.log("userSetName", Json.getJson("userSetName"));
      const wRes = await GetData(
        API_END_POINT.stet.getWorkingInfo + "/" + userSetName
      );
      resStore["workingInfo"] = wRes;
      let wStore = Json.getJson("workingInfo");
      if (!wStore.lastUpdate) {
        wStore = Json.updateJson("workingInfo", wRes);
      } else if (
        wStore.lastUpdate &&
        wRes.lastUpdate &&
        isDateGrater(wRes.lastUpdate, wStore.lastUpdate)
      ) {
        wStore = Json.updateJson("workingInfo", wRes);
      }
      Json.updateJson("userSetName", wStore.userSet);
      Json.updateJson("dateSetName", wStore.dateSet);
      resolve({ workingInfoRes: wRes, workingInfo: wStore });
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const getDateSet = async () =>
  new Promise(async (resolve, reject) => {
    try {
      let query = "";
      if (resStore["dateSet"]) {
        query = "?updatedAt=" + resStore["dateSet"].updatedAt;
      }
      const dateSetName = Json.getJson("dateSetName") || "dateSetTest";
      const dateSetRes = await GetData(
        API_END_POINT.stet.getDateSet + "/" + dateSetName + query
      );
      if (dateSetRes.dates && dateSetRes.dates.length) {
        resStore["dateSet"] = dateSetRes;
        Json.updateJson("dateSet", dateSetRes.dates);
      }
      resolve(dateSetRes);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const getUserSet = async () =>
  new Promise(async (resolve, reject) => {
    try {
      let query = "";
      if (resStore["userSet"]) {
        query = "?updatedAt=" + resStore["userSet"].updatedAt;
      }
      const userSetName = Json.getJson("userSetName") || "userSetTest";
      const userSetRes = await GetData(
        API_END_POINT.stet.getUserSet + "/" + userSetName + query
      );
      if (userSetRes.userids && userSetRes.userids.length) {
        resStore["userSet"] = userSetRes;
        Json.updateJson("userSet", userSetRes.userids);
      }
      // console.log("resStore", resStore);
      resolve(userSetRes);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const createLogReq = async (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const createLogRes = await CreateData(API_END_POINT.stet.createLog, data);
      // console.log("createLogRes", createLogRes);
      resolve(createLogRes);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const updateWorkingInfo = async (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const updateWorkingInfoRes = await CreateData(
        API_END_POINT.stet.updateWorkingInfo,
        data
      );
      // console.log("updateWorkingInfoRes", updateWorkingInfoRes);
      resolve(updateWorkingInfoRes);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const checkUserId = async (userid) =>
  new Promise(async (resolve, reject) => {
    try {
      const checkUserIdRes = await GetData(
        API_END_POINT.stet.check + "/" + userid
      );
      resolve(checkUserIdRes);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const createIdStatus = async (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const createIdStatusRes = await CreateData(
        API_END_POINT.stet.createIdStatus,
        data
      );
      // console.log("createIdStatusRes", createIdStatusRes);
      resolve(createIdStatusRes);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

const updateIdStatus = async (data) =>
  new Promise(async (resolve, reject) => {
    try {
      console.log("updateIdStatus =>>>> data", data);
      const updateIdStatusRes = await CreateData(
        API_END_POINT.stet.updateIdStatus,
        data
      );
      // console.log("updateIdStatusRes", updateIdStatusRes);
      resolve(updateIdStatusRes);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet request service fnTemplate");
    }
  });

module.exports = {
  getWorkingInfo,
  getDateSet,
  getUserSet,
  createLogReq,
  updateWorkingInfo,
  checkUserId,
  createIdStatus,
  updateIdStatus,
};
