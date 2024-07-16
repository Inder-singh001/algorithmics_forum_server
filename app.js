const bodyParser = require("body-parser");
const express = require('express');
const routes = require('./routes/index');
const app = express();
const port = process.env.PORT;
const cors = require('cors')
const {auth} = require('./middleware/Auth')
const {guest} = require('./middleware/Guest')

app.use(cors())
app.use(guest)

app.use('/post',auth)

app.use(bodyParser.json({ limit: '200mb' }));

Object.values(routes).forEach((value) => {
    app.use(value);
});

app.listen(port, () => {
    console.log(port);
});