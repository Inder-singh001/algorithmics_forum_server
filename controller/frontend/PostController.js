const postModel  =  require("../../models/frontend/Post")
const { postCategory } = require('../../models/index')
const { validatorMake }  = require('../../helper/General');
const { populate } = require("dotenv");

const index = async (req, res) => {
    let { search, status, from_date, end_date }  = req.query
    let where       = {};
    
    if(search)
    {
        search = new RegExp(search,'i')
        where = {
            $or:[
                {
                    "title":search
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
        'title',
        'cat_id',
        'description',
        'file',
        'status',
        'type',
        'created_at'
    ];

    // let select = {
    //     "_id":0
    // }

    let joins = [
        {
            path:'cat_id',
            select:{
                'created_at':0
            }
        }
    ]

    let data = await postModel.getListing(req, select, where, joins);    
    if(data)
    {
        let count = await postModel.getCounts(where)
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

    let data = await postModel.getById(id, select);
    
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
            "title": "required"
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await postModel.insert(data);
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
        let resp = await postModel.update(id,data);
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
        let resp = await postModel.update(id,data);
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
    
    let resp = await postModel.remove(id);
    
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