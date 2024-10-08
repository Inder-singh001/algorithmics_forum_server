const userFriendsModel  =  require("../../models/frontend/UserFriends") // Importing the Post model
const { validatorMake }  = require('../../helper/General'); // Importing the validatorMake function
const { populate } = require("dotenv"); // Importing the populate function from dotenv

const index = async (req, res) => {
    let { search, status, from_date, end_date }  = req.query // Destructuring the query parameters
    let where       = {};
    
    if(search)
    {
        search = new RegExp(search,'i') // Creating a case-insensitive regular expression for search
        where = {
            $or:[
                {
                    "title":search // Searching for posts with matching title
                }
            ]
        }
    }

    if(status >= 0)
    {
        where = {
            ...where,
            'status':status // Filtering posts by status
        }  
    }

    if(end_date && from_date)
    {
        where = {
            ...where,
            'created_at':{
                $gte:new Date(from_date),
                $lte:new Date(end_date+" 23:59:59") // Filtering posts by created date range
            }
        } 
    }
    else if(end_date)
    {
        where = {
            ...where,
            'created_at':{
                $lte:new Date(end_date+" 23:59:59") // Filtering posts by end date
            }
        } 
    }
    else if(from_date)
    {
        where = {
            ...where,
            'created_at':{
                $gte:new Date(from_date), // Filtering posts by start date
            }
        } 
    }

    let select = [
        'user_id',
        'friend_id',
        'created_at',
        'updated_at',
    ];

    let joins = [
        {
            path:'user_id',
            select:{
                'created_at':0 // Excluding the created_at field from the cat_id join
            }
        },
        {
            path:'friend_id',
            select:{
                'created_at':0 // Excluding the created_at field from the cat_id join
            }
        }
    ]

    let data = await userFriendsModel.getListing(req, select, where, joins); // Fetching posts based on the filters
    if(data)
    {
        let count = await userFriendsModel.getCounts(where) // Getting the count of posts based on the filters
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
    let {id} = req.params; // Getting the post ID from the request parameters
    
    let select = [
        'user_id',
        'friend_id',
        'created_at',
        'updated_at',
    ];
    let joins = [
        {
            path:'user_id',
            select:{
                'created_at':0 // Excluding the created_at field from the cat_id join
            }
        },
        {
            path:'friend_id',
            select:{
                'created_at':0 // Excluding the created_at field from the cat_id join
            }
        }
    ]

    let data = await userFriendsModel.getById(id, select); // Fetching the post details by ID
    
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
    let data = req.body; // Getting the post data from the request body
    let validatorRules = await validatorMake(
        data,
        {
            "user_id": "required",
            "friend_id":"required" // Validating that the title field is required
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await userFriendsModel.insert(data); // Inserting the post data into the database
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
    let {id} = req.params; // Getting the post ID from the request parameters
    let data = req.body; // Getting the updated post data from the request body
    let validatorRules = await validatorMake(
        data,
        {
            "user_id": "required",
            "friend_id":"required",  // Validating that the first_name field is required
        }
    );

    if(!validatorRules.fails())
    {
        let resp = await userFriendsModel.update(id,data); // Updating the post data in the database
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

// const updateStatus = async (req, res) => {
//     let {id} = req.params; // Getting the post ID from the request parameters
//     let data = req.body; // Getting the updated status data from the request body
//     let validatorRules = await validatorMake(
//         data,
//         {
//             "status": "required" // Validating that the status field is required
//         }
//     );

//     if(!validatorRules.fails())
//     {
//         let resp = await userFriendsModel.update(id,data); // Updating the post status in the database
//         if(resp)
//         {
//             res.send({
//                 'status':true,
//                 'message':'Record Updated Successfully',
//                 'data':resp
//             })
//         }
//         else
//         {
//             res.send({
//                 'status':true,
//                 'message':'Something went wrong',
//                 'data':[]
//             })
//         }
//     }
//     else
//     {
//         res.send({
//             'status':false,
//             'message':validatorRules.errors // Sending validation errors if any
//         });
//     }
// };

const deleteRow = async (req, res) => {
    let {id} = req.params; // Getting the post ID from the request parameters
    
    let resp = await userFriendsModel.remove(id); // Deleting the post from the database
    
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

module.exports = { add, detail, index, update, deleteRow };
