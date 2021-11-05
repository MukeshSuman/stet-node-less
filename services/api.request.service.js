const got = require("got");
const FormData = require("form-data");
var request = require("request");
var cookieJar = request.jar();

// const baseUrl = "https://cdn3.digialm.com//EForms/";
const baseUrl = "https://g21.digialm.com//EForms/";
const comData = "formId=66709&orgId=1631";
const comDataObj = {
	formId: "66709",
	orgId: "1631",
};

const resFormData = {
	userid: "",
	confData: "",
	useridForgotPwd: "",
	loginHtmlPath: "/html/form66709/login.html",
	orgId: 1631,
	formId: 66709,
	userID: "",
	isPwdGenerationReq: "N",
	withdrawalFormId: "",
	redirectFormId: "",
	hash: "",
	mobileGetPwd: "",
	changePwd_success: "",
	copyrightYear: 2021,
	data_deletion: "N",
	consent_required: "N",
	consent_agreed: "",
	isFormMultilingualRequired: "N",
	multilingualLanguageSelected: "Hindi",
	loginHtmlPath: "/html/form66709/login.html",
	orgId: 1631,
	formId: 66709,
	isPwdGenerationReq: "N",
	loginHtmlPath: "/html/form66709/login.html",
	orgId: "1631",
	formId: "66709",
	isPwdGenerationReq: "N",
};

const gotApiHit = async (
	data = { userid: "STET149529", password: "02061987" },
) =>
	new Promise(async (resolve, reject) => {
		try {
			const { userid, password } = data;
			const hitUrl = "loginAction.do?subAction=ValidateUser";
			const reqUrl = `${baseUrl}${hitUrl}&${comData}&userid=${userid}&confData=${password}`;
			const response = await got.post(reqUrl, {
				responseType: "text",
				resolveBodyOnly: false,
			});
			const { ip, body, requestUrl, redirectUrls, url, statusCode } =
				response;
			resolve({
				ip,
				body,
				requestUrl,
				redirectUrls,
				url,
				statusCode,
			});
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});

	const requestApiHit = async (
		data = { userid: "STET149529", password: "02061987" }
	  ) =>
		new Promise(async (resolve, reject) => {
		  try {
			cookieJar = await request.jar();
			const { userid, password } = data;
			console.log(userid, password);
			const hitUrl = "loginAction.do?subAction=ValidateUser";
			const url = `${baseUrl}${hitUrl}&${comData}&userid=${userid}&confData=${password}`;
			console.log(url)
			request.post(
			  {
				// headers: { "content-type": "application/x-www-form-urlencoded" },
				url: url,
				body: "",
				jar: cookieJar,
				// formData: { ...resFormData, userid, password },
			  },
			  async (error, response, body) => {
				if (error) {
				  resolve(error); // calling `reject` will cause the promise to fail with or without the error passed as an argument
				  console.error(`Error while apiCall error - ${error}`);
				  return; // and we don't want to go any further
				} else {
				  console.log(response.statusCode);
				  resolve(response);
				}
			  }
			);
		  } catch (e) {
			console.error(e);
			reject(e);
		  }
		});

module.exports = {
	gotApiHit,
	requestApiHit
};
