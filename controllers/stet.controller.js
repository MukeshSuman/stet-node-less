"use strict";
var { StetApi } = require("../services");

const stetTest = async (req, res, next) => {
  try {
    return res
      .status(200)
      .json({ status: 200, data: "working fine", message: "Succes" });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

const stetStatus = async (req, res, next) => {
  try {
    let workingInfo = await StetApi.stetStatus();
    return res
      .status(200)
      .json({ status: 200, data: workingInfo, message: "Succes" });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

const stetStart = async (req, res, next) => {
  try {
    const tokenNumber = req.query.token ? +req.query.token : 0;
    const userSetName = req.query.userSet || req.query.userSetName;
    let stetStartProgramRes = await StetApi.stetStart(tokenNumber, userSetName);
    return res
      .status(200)
      .json({ status: 200, data: stetStartProgramRes, message: "Succes" });
  } catch (e) {
    return res.status(400).json({ status: 400, ...e });
  }
};

const stetStop = async (req, res, next) => {
  try {
    let stetStopRes = await StetApi.stetStop();
    return res
      .status(200)
      .json({ status: 200, data: stetStopRes, message: "Succes" });
  } catch (e) {
    return res.status(400).json({ status: 400, message: e.message });
  }
};

const stetPreStart = async (req, res, next) => {
  try {
    let stetStopRes = await StetApi.stetPreStart();
    return res
      .status(200)
      .json({ status: 200, data: stetStopRes, message: "Succes" });
  } catch (e) {
    return res.status(400).json({ status: 400, ...e });
  }
};

module.exports = {
  stetTest,
  stetStatus,
  stetStart,
  stetStop,
  stetPreStart,
};
