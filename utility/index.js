"use strict";
var Json = require("./json");

const getRandomIntInclusive = (min = 100000, max = 999999) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

const convertToIST = (dateTime = new Date()) => {
  let d = new Date(dateTime).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  console.log(d);
  return d;
};

const isDateGrater = (dateA = new Date(), dateB = new Date()) => {
  let a = new Date(dateA).valueOf();
  let b = new Date(dateB).valueOf();
  return a > b;
};

module.exports = {
  Json: { ...Json },
  getRandomIntInclusive,
  convertToIST,
  isDateGrater,
};
