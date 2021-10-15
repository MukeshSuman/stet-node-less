const express = require("express");
const product = require("./api/product");
const stet = require("./api/stet");
const test = require("./api/test");

const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 5050;

app.use("/api/product", product);
app.use("/api/stet", stet);
app.use("/api/test", test);

app.listen(PORT, () => {
	console.log(`Server is running in port ${PORT}`);
});
