const bodyParser = require("body-parser");
const express    = require('express');
const routes     = require('./routes/index');
const app        = express();
const port       = process.env.PORT;

app.use(bodyParser.json({limit: '200mb'}));

Object.values(routes).forEach((value) => {
    app.use(value);
});

app.listen(port, () => {
    console.log(port);
});