const postCategoryModel  =  require("../../models/frontend/PostCategory") // Importing the PostCategory model
const { validatorMake }  = require('../../helper/General') // Importing the validatorMake function

const index = async (req, res) => {
    let { search, status, from_date, end_date }  = req.query // Destructuring the query parameters
    let where       = {}; // Initializing the where object
    
    if(search)
    {
        search = new RegExp(search,'i') // Creating a case-insensitive regular expression for search
        where = {
            $or:[
                {
                    "title":search // Adding the search condition to the where object
                }
            ]
        }
    }

    if(status >= 0)
    {
        where = {
            ...where,
            'status':status // Adding the status condition to the where object
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

    let data = await postCategoryModel.getListing(req, [], where); // Fetching data based on the where conditions   
    if(data)
    {
        let count = await postCategoryModel.getCounts(where) // Counting the number of records based on the where conditions
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
    let {id} = req.params; // Extracting the id parameter from the request
    
    let select = [
        'slug',
        'title',
        'status',
        'created_at',
        'updated_at',
    ];

    let data = await postCategoryModel.getById(id, select); // Fetching data for a specific id
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
    let data = req.body; // Extracting the data from the request body
    let validatorRules = await validatorMake(
        data,
        {
            "title": "required" // Validating the presence of the title field
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await postCategoryModel.insert(data); // Inserting the data into the database
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
            'message':validatorRules.errors // Sending validation errors if any
        });
    }
};

const update = async (req, res) => {
    let {id} = req.params; // Extracting the id parameter from the request
    let data = req.body; // Extracting the data from the request body
    let validatorRules = await validatorMake(
        data,
        {
            "title": "required", // Validating the presence of the title field
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await postCategoryModel.update(id,data); // Updating the record with the given id
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
            'message':validatorRules.errors // Sending validation errors if any
        });
    }
};

const updateStatus = async (req, res) => {
    let {id} = req.params; // Extracting the id parameter from the request
    let data = req.body; // Extracting the data from the request body
    let validatorRules = await validatorMake(
        data,
        {
            "status": "required" // Validating the presence of the status field
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await postCategoryModel.update(id,data); // Updating the record with the given id
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
            'message':validatorRules.errors // Sending validation errors if any
        });
    }
};

const deleteRow = async (req, res) => {
    let {id} = req.params; // Extracting the id parameter from the request
    
    let resp = await postCategoryModel.remove(id); // Deleting the record with the given id
    
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

module.exports = { add, detail, index, update, updateStatus, deleteRow }; // Exporting the controller functions
