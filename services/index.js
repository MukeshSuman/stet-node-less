"use strict";
const StetApi = require("./stet.api.service");
var ApiRequest = require("./api.request.service");

module.exports = {
	StetApi: { ...StetApi },
	ApiRequest: { ...ApiRequest },
};
