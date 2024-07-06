const postVoteModel  =  require("../../models/frontend/PostVote") // Importing the PostVote model
const { postVote } = require('../../models/index') // Importing the postVote model from index.js
const { validatorMake }  = require('../../helper/General'); // Importing the validatorMake function from General.js
const { populate } = require("dotenv"); // Importing the populate function from dotenv

const index = async (req, res) => {
    let { search, status, from_date, end_date }  = req.query // Destructuring the query parameters
    let where       = {}; // Initializing the where object
    
    if(search)
    {
        search = new RegExp(search,'i') // Creating a regular expression for search
        where = {
            $or:[
                {
                    "created_at":search // Adding the search condition to the where object
                }
            ]
        }
    }

    if(type >= 0)
    {
        where = {
            ...where,
            'type':type // Adding the status condition to the where object
        }  
    }

    if(end_date && from_date)
    {
        where = {
            ...where,
            'created_at':{
                $gte:new Date(from_date),
                $lte:new Date(end_date+" 23:59:59") // Adding the date range condition to the where object
            }
        } 
    }
    else if(end_date)
    {
        where = {
            ...where,
            'created_at':{
                $lte:new Date(end_date+" 23:59:59") // Adding the end date condition to the where object
            }
        } 
    }
    else if(from_date)
    {
        where = {
            ...where,
            'created_at':{
                $gte:new Date(from_date), // Adding the start date condition to the where object
            }
        } 
    }

    let select = [
        'user_id',
        'post_id',
        'type',
        'created_at',
        'updated_at',
        'cat_id'
    ];

    let joins = [
        {
            path:'user_id',
            select:{
                'created_at':0
            }
        },
        {
            path:'post_id',
            select:{
                'created_at':0
            }
        }
    ]

    let data = await postModel.getListing(req, select, where, joins); // Fetching data from the postModel
    if(data)
    {
        let count = await postModel.getCounts(where) // Getting the count of records
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
    let {id} = req.params; // Getting the id parameter
    
    let select = [
        'user_id',
        'post_id',
        'type',
        'created_at',
        'updated_at',
    ];

    let data = await postModel.getById(id, select); // Fetching data from the postModel
    
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
    let data = req.body; // Getting the request body
    let validatorRules = await validatorMake(
        data,
        {
            "user_id": "required",
            "post_id":"required",
            "type":"required",
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await postModel.insert(data); // Inserting data into the postModel
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
    let {id} = req.params; // Getting the id parameter
    let data = req.body; // Getting the request body
    let validatorRules = await validatorMake(
        data,
        {
            "type":"required",
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await postModel.update(id,data); // Updating data in the postModel
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
    let {id} = req.params; // Getting the id parameter
    let data = req.body; // Getting the request body
    let validatorRules = await validatorMake(
        data,
        {
            "type": "required"
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await postModel.update(id,data); // Updating data in the postModel
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
    let {id} = req.params; // Getting the id parameter
    
    let resp = await postModel.remove(id); // Removing the record from the postModel
    
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
