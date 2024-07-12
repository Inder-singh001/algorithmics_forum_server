const userModel = require("../../models/frontend/User")
const { validatorMake, getRandomNumber, getHash, _datetime, sendMail, encrypt } = require('../../helper/General')

const index = async (req, res) => {
    let { search, status, from_date, end_date } = req.query
    let where = {};

    if (search) {
        search = new RegExp(search, 'i')
        where = {
            $or: [
                {
                    "first_name": search
                }
            ]
        }
    }

    if (status >= 0) {
        where = {
            ...where,
            'status': status
        }
    }

    if (end_date && from_date) {
        where = {
            ...where,
            'created_at': {
                $gte: new Date(from_date),
                $lte: new Date(end_date + " 23:59:59")
            }
        }
    }
    else if (end_date) {
        where = {
            ...where,
            'created_at': {
                $lte: new Date(end_date + " 23:59:59")
            }
        }
    }
    else if (from_date) {
        where = {
            ...where,
            'created_at': {
                $gte: new Date(from_date),
            }
        }
    }

    let select = [
        'first_name',
        'last_name',
        'email',
        'about_me',
        'created_at',
        'status',
        'token',
        'otp',
        'cat_id'
    ];

    let joins = [
        {
            path: 'cat_id',
            select: {
                'updated_at': 0 // Excluding the updated_at field from the cat_id join
            }
        }
    ]

    let data = await userModel.getListing(req, select, where, joins);
    if (data) {
        let count = await userModel.getCounts(where)
        res.send({
            'status': true,
            'message': 'Data Fetch Successfully',
            'total': count,
            'data': data
        })
    }
    else {
        res.send({
            'status': true,
            'message': 'Something went wrong',
            'data': []
        })
    }
};

const detail = async (req, res) => {
    let { id } = req.params;

    let select = [
        'first_name',
        'last_name',
        'email',
        'about_me',
        'created_at',
        'status',
        'author',
        'token',
        'otp'
    ];
    let joins = [
        {
            path: 'author',
            select: {
                'updated_at': 0 // Excluding the updated_at field from the cat_id join
            }
        }
    ]

    let data = await userModel.getById(id, select, joins);

    if (data) {
        res.send({
            'status': true,
            'message': 'Data Fetch Successfully',
            'data': data
        });
    }
    else {
        res.send({
            'status': false,
            'message': 'Something went wrong',
            'data': []
        });
    }
};

const add = async (req, res) => {
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "first_name": "required",
            "last_name": "required",
            "email": "required",
            "password": "required",
            "about_me": "required",
        }
    );

    if (!validatorRules.fails()) {
        let resp = await userModel.insert(data);
        if (resp) {
            res.send({
                'status': true,
                'message': 'Record Saved Successfully',
                'data': resp
            })
        }
        else {
            res.send({
                'status': true,
                'message': 'Something went wrong',
                'data': []
            })
        }
    }
    else {
        res.send({
            'status': false,
            'message': validatorRules.errors
        });
    }
};

const update = async (req, res) => {
    let { id } = req.params;
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "first_name": "required",
            "last_name": "required",
            "email": "required",
            "about_me": "required",
        }
    );

    if (!validatorRules.fails()) {
        let resp = await userModel.update(id, data);
        if (resp) {
            res.send({
                'status': true,
                'message': 'Record Updated Successfully',
                'data': resp
            })
        }
        else {
            res.send({
                'status': true,
                'message': 'Something went wrong',
                'data': []
            })
        }
    }
    else {
        res.send({
            'status': false,
            'message': validatorRules.errors
        });
    }
};

const updateStatus = async (req, res) => {
    let { id } = req.params;
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "status": "required"
        }
    );

    if (!validatorRules.fails()) {
        let resp = await userModel.update(id, data);
        if (resp) {
            res.send({
                'status': true,
                'message': 'Record Updated Successfully',
                'data': resp
            })
        }
        else {
            res.send({
                'status': true,
                'message': 'Something went wrong',
                'data': []
            })
        }
    }
    else {
        res.send({
            'status': false,
            'message': validatorRules.errors
        });
    }
};

const deleteRow = async (req, res) => {
    let { id } = req.params;

    let resp = await userModel.remove(id);

    if (resp) {
        res.send({
            'status': true,
            'message': 'Record Deleted Successfully',
            'data': resp,
        })
    }
    else {
        res.send({
            'status': true,
            'message': 'Something went wrong',
            'data': []
        })
    }
};

const signup = async (req, res) => {
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "first_name": "required",
            "last_name": "required",
            "email": "required|exist",
            "password": "required|confirmed",
            "password_confirmation": "required"
        }
    );

    let passes = async () => {
        data.email_verified = null;
        data.otp = getRandomNumber();
        data.token = getHash(64);
        data.token_expiry_at = _datetime(null, 30);

        let resp = await userModel.insert(data);
        if (resp) {
            sendMail(data.email, "One Time Password", `<h1>${data.otp}</h1>`)
            res.send({
                'status': true,
                'message': 'Registration Successful',
                'data': resp
            })
        }
        else {
            res.send({
                'status': false,
                'message': 'Registration Failed, Try again',
                'data': []
            })
        }
    }

    let fails = () => {
        res.send({
            'status': false,
            'message': validatorRules.errors
        });
    }

    validatorRules.checkAsync(passes, fails)
}

const resendOtp = async (req, res) => {
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "token": "required"
        }
    );
    if (!validatorRules.fails()) {
        let resp = await userModel.getRow({
            token: data.token
        });
        if (resp) {
            if (!resp.otp) {
                //generate new otp
            }

            sendMail(resp.email, "One Time Password", `<h1>${resp.otp}</h1>`)
            res.send({
                'status': true,
                'message': 'OTP Sent to your registered email',
                'data': resp
            })
        }
        else {
            res.send({
                'status': false,
                'message': 'Register again!',
                'data': []
            })
        }
    }
    else {
        res.send({
            'status': false,
            'message': validatorRules.errors
        });
    }
}

const verifyOtp = async (req, res) => {
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "token": "required",
            "otp": "required",
        }
    );
    if (!validatorRules.fails()) {
        let resp = await userModel.getRow({
            token: data.token
        });
        if (resp) {
            if (resp.otp == data.otp) {
                let update = {
                    email_verified: 1,
                    email_verified_at: _datetime(),
                    otp: null,
                    token: null
                }
                let userUpdate = await userModel.update(resp._id, update);
                if (userUpdate) {
                    sendMail(resp.email, "verification complete", `<h1>verification complete</h1>`)
                    res.send({
                        'status': true,
                        'message': 'Verified Successfully!',
                        'data': userUpdate
                    })
                }
                else {
                    res.send({
                        'status': false,
                        'message': 'Verification Failed!',
                        'data': []
                    })
                }
            }
            else {
                res.send({
                    'status': false,
                    'message': 'OTP Mis-match. Check your OTP and try again!',
                    'data': []
                })
            }
        }
        else {
            res.send({
                'status': false,
                'message': 'Register Again!',
                'data': []
            })
            // console.log("wrong token")
        }
    }
    else {
        res.send({
            'status': false,
            'message': validatorRules.errors
        });
    }
}

const login = async (req, res) => {
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "email": "required",
            "password": "required",
        }
    );
    if (!validatorRules.fails()) {
        let resp = await userModel.getRow({
            email: data.email
        });

        if (resp) {
            if (resp.email_verified) {
                if (resp.password == encrypt(data.password)) {
                    let update = {
                        token: null,
                        login_token: getHash(64),
                        last_login_at: _datetime()
                    }
                    let userUpdate = await userModel.update(resp._id, update);
                    if (userUpdate) {
                        res.send({
                            'status': true,
                            'message': 'Login Successfully!',
                            'data': userUpdate
                        })
                    }
                    else {
                        res.send({
                            'status': false,
                            'message': 'Login Failed, Try Again!',
                            'data': []
                        })
                    }
                }
                else {
                    res.send({
                        'status': false,
                        'message': 'Wrong Password!',
                        'data': []
                    })
                }
            }
            else {
                if (!resp.otp) {
                    //redirect to otp page and resend otp
                }

                sendMail(resp.email, "One Time Password", `<h1>${resp.otp}</h1>`)
                res.send({
                    status: true,
                    message: "Please verified you email",
                    data: resp
                })
            }
        }
        else {
            res.send({
                'status': true,
                'message': 'user not found',
                'data': []
            })
        }
    }
    else {
        res.send({
            'status': false,
            'message': validatorRules.errors
        });
    }
}

module.exports = { add, detail, index, update, updateStatus, deleteRow, signup, resendOtp, verifyOtp, login };