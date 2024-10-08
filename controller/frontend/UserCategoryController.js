const userCategoryModel = require("../../models/frontend/UserCategory") // Importing the Post model
const { postCategory } = require('../../models/index') // Importing the postCategory model
const { validatorMake } = require('../../helper/General'); // Importing the validatorMake function
const { populate } = require("dotenv"); // Importing the populate function from dotenv
const userModel = require("../../models/frontend/User");

const index = async (req, res) => {
    let { search, status, from_date, end_date } = req.query // Destructuring the query parameters
    let where = {};

    if (search) {
        search = new RegExp(search, 'i') // Creating a case-insensitive regular expression for search
        where = {
            $or: [
                {
                    "title": search // Searching for posts with matching title
                }
            ]
        }
    }

    if (status >= 0) {
        where = {
            ...where,
            'status': status // Filtering posts by status
        }
    }

    if (end_date && from_date) {
        where = {
            ...where,
            'updated_at': {
                $gte: new Date(from_date),
                $lte: new Date(end_date + " 23:59:59") // Filtering posts by created date range
            }
        }
    }
    else if (end_date) {
        where = {
            ...where,
            'updated_at': {
                $lte: new Date(end_date + " 23:59:59") // Filtering posts by end date
            }
        }
    }
    else if (from_date) {
        where = {
            ...where,
            'updated_at': {
                $gte: new Date(from_date), // Filtering posts by start date
            }
        }
    }

    let select = [
        'user_id',
        'cat_id',
        'updated_at'
    ];

    let joins = [
        {
            path: 'user_id',
            select: {
                'updated_at': 0 // Excluding the updated_at field from the cat_id join
            }
        },
        {
            path: 'cat_id',
            select: {
                'updated_at': 0 // Excluding the updated_at field from the cat_id join
            }
        },
    ]

    let data = await userCategoryModel.getListing(req, select, where, joins); // Fetching posts based on the filters
    if (data) {
        let count = await userCategoryModel.getCounts(where) // Getting the count of posts based on the filters
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
    let { id } = req.params; // Getting the post ID from the request parameters

    let select = [
        'user_id',
        'cat_id',
        'updated_at'
    ];
    let joins = [
        {
            path: 'user_id',
            select: {
                'updated_at': 0,
                'created_at': 0,
                'status': 0,
                'password': 0,
                'about_me': 0 // Excluding the updated_at field from the cat_id join
            }
        },
        {
            path: 'cat_id',
            select: {
                'updated_at': 0,
                'created_at': 0,
                'status': 0,
                'slug': 0     // Excluding the updated_at field from the cat_id join
            }
        }
    ]

    let data = await userCategoryModel.getById(id, select, joins); // Fetching the post details by ID

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

    let IDCategory = await userModel.getLoginUserId(req)
    let userId = IDCategory ? IDCategory._id : null;
    if (userId) {
        let data = req.body; // Getting the post data from the request body
        let validatorRules = await validatorMake(
            data,
            {
                "cat_id": "required" // Validating that the title field is required
            }
        );
        if (!validatorRules.fails()) {
            data.user_id = userId
            let resp = await userCategoryModel.insert(data); // Inserting the post data into the databaseF
            if (resp) {
                res.send({
                    'status': true,
                    'message': 'Loading feed based on your interests.',
                    'data': resp
                })
            }

            else {
                res.send({
                    'status': false,
                    'message': 'Network error!',
                    'data': []
                })
            }
        }
        else {
            res.send({
                'status': false,
                'message': validatorRules.errors // Sending validation errors if any
            });
        }
    }
    else {
        res.status(401).send({
            'status': false,
            'message': "Authentication error" // Sending validation errors if any
        });
    }
};

const update = async (req, res) => {
    let { id } = req.params; // Getting the post ID from the request parameters
    let data = req.body; // Getting the updated post data from the request body
    let validatorRules = await validatorMake(
        data,
        {
            "user_id": "required",
            "cat_id": "required",  // Validating that the first_name field is required
        }
    );

    if (!validatorRules.fails()) {
        let resp = await userCategoryModel.update(id, data); // Updating the post data in the database
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
            'message': validatorRules.errors // Sending validation errors if any
        });
    }
};

const updateStatus = async (req, res) => {
    let { id } = req.params; // Getting the post ID from the request parameters
    let data = req.body; // Getting the updated status data from the request body
    let validatorRules = await validatorMake(
        data,
        {
            "status": "required" // Validating that the status field is required
        }
    );

    if (!validatorRules.fails()) {
        let resp = await userCategoryModel.update(id, data); // Updating the post status in the database
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
            'message': validatorRules.errors // Sending validation errors if any
        });
    }
};

const deleteRow = async (req, res) => {
    let { id } = req.params; // Getting the post ID from the request parameters

    let resp = await userCategoryModel.remove(id); // Deleting the post from the database

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

module.exports = { add, detail, index, update, updateStatus, deleteRow };