const Validator = require('validatorjs');
var md5 = require('md5');
var moment = require('moment');
const nodemailer = require('nodemailer');

const sendMail = (to, subject, body) => {

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: "globiznotification@gmail.com",
            pass: "mmcxulnkhaxcngqo"
        }
    });

    transporter.sendMail({
        from: "globiznotification@gmail.com",
        to: to,
        subject: subject,
        html: body
    }).then(result => {
        return true;
    }).catch(err => {
        console.log(err);
        return false;
    });
}

const validatorMake = async (data, rules, message) => {
    let validation = new Validator(data, rules, message);
    let userModel = require('../models/frontend/User')

    Validator.registerAsync('exist', async function (value, attr, req, passes) {

        let check = await userModel.getRow(
            {
                email: value
            }
        )
        if (check) {
            passes(false, " email exists");
        }
        else {
            passes();
        }
    })

    return validation;
}

const encrypt = (string) => {
    return md5(string);
}

const getHash = (length = 32) => {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

const _moment = (timestamp = null) => {
    if (timestamp) return moment(timestamp).utcOffset("+05:30");
    else return moment().utcOffset("+05:30");
}

const foreach = (obj, callback) => {
    for (let [key, value] of Object.entries(obj)) {
        callback(key, value);
    }
    return true;
}

const getBearerToken = (req) => {
    if (
        req &&
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        let token = req.headers.authorization.split(" ");

        if (token && token.length > 1) {
            return token && token[1] ? token[1].trim() : '';
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}

const _date = (timestamp = null) => {
    if (timestamp) {
        return moment(timestamp).utcOffset("+05:30").format("YYYY-MM-DD");
    }
    else {
        return moment().utcOffset("+05:30").format("YYYY-MM-DD");
    }
}

const _datetime = (timestamp = null, addTime = null) => {
    if (timestamp) {
        return moment(timestamp)
            .utcOffset("+05:30")
            .format("YYYY-MM-DD HH:mm:ss");
    }
    else {
        if (addTime) {
            return moment().add(addTime, 'minutes').utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
        }
        else {
            return moment().utcOffset("+05:30").format("YYYY-MM-DD HH:mm:ss");
        }
    }
}

const getRandomNumber = (length = 6) => {
    var result = "";
    var characters = "0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }

    return result;
}

// Function to generate a random password
const generatePassword = (length = 8) =>{ // Length of the password
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", // Characters to include in the password
        retVal = ""; // Variable to store the generated password
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n)); // Randomly select a character from the charset and add it to the password
    }
    return retVal; // Return the generated password
}


const isJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
module.exports = {
    foreach,
    validatorMake,
    encrypt,
    getHash,
    _moment,
    getBearerToken,
    _datetime,
    _date,
    getRandomNumber,
    isJSON,

    sendMail,
    generatePassword
}
  
}