"use strict";
var { ApiRequest } = require("../services");

const ApiHit = async (req, res, next) => {
	try {
		console.log("Test Controller ApiHit");
		let apiHitRes = await ApiRequest.requestApiHit();
		console.log("apiHitRes", apiHitRes.statusCode);
		return res
			.status(200)
			.json({ status: 200, data: apiHitRes, message: "Succes" });
	} catch (e) {
		console.log("ApiHit error", e);
		return res.status(400).json({ status: 400, type: "catch", ...e });
	}
};

module.exports = {
	ApiHit,
};
