let userModel = require('../models/frontend/User')

let auth = async (req, res, next) => {
    let user = await userModel.getLoginUser(req)
    if(user)
    {
        next();
    }
    else
    {
        return res.status(401).send({
            status:false,
            message:"Unauthenticated"
        })
    }
    console.log(" yes in middleware  ")
}

module.exports ={ auth } ;