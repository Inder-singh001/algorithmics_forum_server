const bodyParser = require("body-parser");
const express = require('express');
const routes = require('./routes/index');
const app = express();
const port = process.env.PORT;
const cors = require('cors')

app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST, PUT, DELETE");
    next();
})

app.use(bodyParser.json({ limit: '200mb' }));

Object.values(routes).forEach((value) => {
    app.use(value);
});

app.listen(port, () => {
    console.log(port);
});