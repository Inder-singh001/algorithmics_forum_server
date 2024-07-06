const userModel  =  require("../../models/frontend/User")
const { validatorMake }  = require('../../helper/General')

const index = async (req, res) => {
    let { search, status, from_date, end_date }  = req.query
    let where       = {};
    
    if(search)
    {
        search = new RegExp(search,'i')
        where = {
            $or:[
                {
                    "first_name":search
                }
            ]
        }
    }

    if(status >= 0)
    {
        where = {
            ...where,
            'status':status
        }  
    }

    if(end_date && from_date)
    {
        where = {
            ...where,
            'created_at':{
                $gte:new Date(from_date),
                $lte:new Date(end_date+" 23:59:59")
            }
        } 
    }
    else if(end_date)
    {
        where = {
            ...where,
            'created_at':{
                $lte:new Date(end_date+" 23:59:59")
            }
        } 
    }
    else if(from_date)
    {
        where = {
            ...where,
            'created_at':{
                $gte:new Date(from_date),
            }
        } 
    }

    let select = [
        'first_name',
        'last_name',
        'email',
        'about_me',
        'created_at',
        'status'
    ];

    // let select = {
    //     "_id":0
    // }

    let data = await userModel.getListing(req, select, where);    
    if(data)
    {
        let count = await userModel.getCounts(where)
        res.send({
            'status':true,
            'message':'Data Fetch Successfully',
            'total' : count,
            'data':data
        })
    }
    else
    {
        res.send({
            'status':true,
            'message':'Something went wrong',
            'data':[]
        })
    }
};

const detail = async (req, res) => {
    let {id} = req.params;
    
    let select = [
        'first_name',
        'last_name',
        'email',
        'about_me',
        'created_at',
        'status'
    ];

    let data = await userModel.getById(id, select);
    
    if(data)
    {
        res.send({
            'status':true,
            'message':'Data Fetch Successfully',
            'data':data
        });
    }
    else
    {
        res.send({
            'status':false,
            'message':'Something went wrong',
            'data':[]
        });
    }
};

const add = async (req, res) => {
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "first_name": "required"
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await userModel.insert(data);
        if(resp)
        {
            res.send({
                'status':true,
                'message':'Record Saved Successfully',
                'data':resp
            })
        }
        else
        {
            res.send({
                'status':true,
                'message':'Something went wrong',
                'data':[]
            })
        }
    }
    else
    {
        res.send({
            'status':false,
            'message':validatorRules.errors
        });
    }
};

const update = async (req, res) => {
    let {id} = req.params;
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "first_name": "required"
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await userModel.update(id,data);
        if(resp)
        {
            res.send({
                'status':true,
                'message':'Record Updated Successfully',
                'data':resp
            })
        }
        else
        {
            res.send({
                'status':true,
                'message':'Something went wrong',
                'data':[]
            })
        }
    }
    else
    {
        res.send({
            'status':false,
            'message':validatorRules.errors
        });
    }
};

const updateStatus = async (req, res) => {
    let {id} = req.params;
    let data = req.body;
    let validatorRules = await validatorMake(
        data,
        {
            "status": "required"
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await userModel.update(id,data);
        if(resp)
        {
            res.send({
                'status':true,
                'message':'Record Updated Successfully',
                'data':resp
            })
        }
        else
        {
            res.send({
                'status':true,
                'message':'Something went wrong',
                'data':[]
            })
        }
    }
    else
    {
        res.send({
            'status':false,
            'message':validatorRules.errors
        });
    }
};

const deleteRow = async (req, res) => {
    let {id} = req.params;
    
    let resp = await userModel.remove(id);
    
    if(resp)
    {
        res.send({
            'status':true,
            'message':'Record Deleted Successfully',
            'data':resp,
        })
    }
    else
    {
        res.send({
            'status':true,
            'message':'Something went wrong',
            'data':[]
        })
    }
};

module.exports = { add, detail, index, update, updateStatus, deleteRow };