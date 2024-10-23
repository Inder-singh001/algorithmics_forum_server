const { _datetime } = require('../helper/General');
let userModel = require('../models/frontend/User')

let auth = async (req, res, next) => {
    let user = await userModel.getLoginUser(req)
    if (user)
    {
        let update = {
            token_expiry_at: _datetime(null, 30)
        }
        userModel.update({ _id: user._id },update)
        next();
    }
    else {
        return res.status(401).send({
            status: false,
            message: "Unauthenticated"
        })
    }
}

module.exports = { auth };