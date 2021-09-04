const express = require("express");
const router = express.Router();
const StetController = require("../controllers/stet.controller");

router.get("/", async (req, res, next) => {
  try {
    res.json({
      status: 200,
      message: "Get data has successfully",
    });
  } catch (error) {
    console.error(error);
    return res.json(500).send("Server error");
  }
});

router.get("/start", StetController.stetStart);
router.get("/prestart", StetController.stetPreStart);
router.get("/stop", StetController.stetStop);
router.get("/status", StetController.stetStatus);
router.get("/updateworkinginfo", StetController.stetUpdateWorkingInfo);

module.exports = router;
