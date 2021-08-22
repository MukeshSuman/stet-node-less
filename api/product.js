const express = require("express");
const router = express.Router();

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

module.exports = router;