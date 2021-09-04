const API_END_POINT = {
  stet: {
    getWorkingInfo: "/common/workinginfo", // /common/workinginfo/{userSet}
    updateWorkingInfo: "/common/workinginfo",
    getDateSet: "/common/dateset", // /common/dateset/{dateSet}
    getUserSet: "/common/userset", // /common/userset/{userSet}
    createLog: "/common/log",
    found: "/common/found",
    notfound: "/common/notfound",
    errorfound: "/common/errorfound",
    check: "/common/check",
    createIdStatus: "/common/useridsstatus/create",
    updateIdStatus: "/common/useridsstatus/update",
  },
};

module.exports = API_END_POINT;
