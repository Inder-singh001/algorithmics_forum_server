const postModel = require("../../models/frontend/Post"); // Importing the Post model
const userModel = require("../../models/frontend/User");
const userFriends = require("../../models/frontend/UserFriends");
const postCommentsModel = require("../../models/frontend/PostComments");
const { validatorMake } = require("../../helper/General"); // Importing the validatorMake function
const { error } = require("console");

const index = async (req, res) => {
    let token = await userModel.getLoginUser(req);
    // console.log(token,"token")
    let { search, status, from_date, end_date } = req.query; // Destructuring the query parameters
    let where = {};

    if (search) {
        search = new RegExp(search, "i"); // Creating a case-insensitive regular expression for search
        where = {
            $or: [
                {
                    title: search, // Searching for posts with matching title
                },
                {
                    description: search, // Searching for posts with matching title
                },
            ],
        };
    }

    if (status >= 0) {
        where = {
            ...where,
            status: status, // Filtering posts by status
        };
    }


    if (end_date && from_date) {
        where = {
            ...where,
            created_at: {
                $gte: new Date(from_date),
                $lte: new Date(end_date + " 23:59:59"), // Filtering posts by created date range
            },
        };
    } else if (end_date) {
        where = {
            ...where,
            created_at: {
                $lte: new Date(end_date + " 23:59:59"), // Filtering posts by end date
            },
        };
    } else if (from_date) {
        where = {
            ...where,
            created_at: {
                $gte: new Date(from_date), // Filtering posts by start date
            },
        };
    }

    let select = {
        "user_id": 1,
        "title": 1,
        "description": 1,
        "file": 1,
        "status": 1,
        "type": 1,
        "cat_id": 1,
        "created_at": 1,
    };

    let joins = [
        {
            path: "user_id",
            select: "_id first_name last_name", // Excluding the created_at field from the cat_id join
        },
        {
            path: "cat_id",
            select: "_id title",
        },
    ];

    let data = await postModel.getListingbyUserID(req, select); // Fetching posts based on the filters
    if (data) {
        let count = await postModel.getCounts(where); // Getting the count of posts based on the filters
        res.send({
            status: true,
            message: "Data Fetch Successfully",
            total: count,
            data: data,
        });
    } else {
        res.send({
            status: true,
            message: "Something went wrong",
            data: [],
        });
    }

};

const detail = async (req, res) => {
    let { id } = req.params; // Getting the post ID from the request parameters

    let select = [
        "user_id",
        "title",
        "description",
        "file",
        "status",
        "type",
        "created_at",
        "cat_id",
    ];
    let joins = [
        // {
        //     path: "user_id",
        //     select: {
        //         _id: 1, // Excluding the created_at field from the cat_id join
        //         first_name: 1,
        //         last_name: 1,
        //     },
        // },
        {
            path: "cat_id",
            select: {
                created_at: 0, // Excluding the created_at field from the cat_id join
            },
        },
    ];

    let data = await postModel.getById(id, select, joins); // Fetching the post details by ID

    if (data) {
        res.send({
            status: true,
            message: "Data Fetch Successfully",
            data: data,
        });
    } else {
        res.send({
            status: false,
            message: "Something went wrong",
            data: [],
        });
    }
};

const add = async (req, res) => {
    try {
        const data = req.body; // Getting the post data from the request body
        const validatorRules = await validatorMake(data, {
            user_id: "required",
            title: "required",
            description: "required",
            type: "required",
        });

        if (!validatorRules.fails()) {
            const resp = await postModel.insert(data); // Inserting the post data into the database
            if (resp) {
                res.status(200).send({
                    status: true,
                    message: "Record Saved Successfully",
                    data: resp,
                });
            } else {
                res.status(500).send({
                    status: false,
                    message: "Something went wrong",
                    data: [],
                });
            }
        } else {
            res.status(400).send({
                status: false,
                message: "Validation failed",
                errors: validatorRules.errors.errors, // Sending validation errors if any
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: false,
            message: "An unexpected error occurred",
        });
    }
};

const update = async (req, res) => {
    let { id } = req.params; // Getting the post ID from the request parameters
    let data = req.body; // Getting the updated post data from the request body
    let validatorRules = await validatorMake(data, {
        title: "required",
        description: "required",
        type: "required", // Validating that the first_name field is required
    });

    if (!validatorRules.fails()) {
        let resp = await postModel.update(id, data); // Updating the post data in the database
        if (resp) {
            res.send({
                status: true,
                message: "Record Updated Successfully",
                data: resp,
            });
        } else {
            res.send({
                status: true,
                message: "Something went wrong",
                data: [],
            });
        }
    } else {
        res.send({
            status: false,
            message: validatorRules.errors, // Sending validation errors if any
        });
    }
};

const updateStatus = async (req, res) => {
    let { id } = req.params; // Getting the post ID from the request parameters
    let data = req.body; // Getting the updated status data from the request body
    let validatorRules = await validatorMake(data, {
        status: "required", // Validating that the status field is required
    });

    if (!validatorRules.fails()) {
        let resp = await postModel.update(id, data); // Updating the post status in the database
        if (resp) {
            res.send({
                status: true,
                message: "Record Updated Successfully",
                data: resp,
            });
        } else {
            res.send({
                status: true,
                message: "Something went wrong",
                data: [],
            });
        }
    } else {
        res.send({
            status: false,
            message: validatorRules.errors, // Sending validation errors if any
        });
    }
};

const deleteRow = async (req, res) => {
    let { id } = req.params; // Getting the post ID from the request parameters

    let resp = await postModel.remove(id); // Deleting the post from the database

    if (resp) {
        res.send({
            status: true,
            message: "Record Deleted Successfully",
            data: resp,
        });
    } else {
        res.send({
            status: true,
            message: "Something went wrong",
            data: [],
        });
    }
};

const featuredPost = async (req, res) => {
    let select = ["first_name", "last_name"];

    let postUser = await userModel.getFeaturedPost(req, select);

    if (postUser) {
        res.send({
            status: true,
            message: "Data Fetch Successfully",
            data: postUser,
        });
    } else {
        res.send({
            status: false,
            message: "No Data Found",
            data: [],
        });
    }
}

const userPost = async (req, res) => {
    try {
        let {search} = req.query
        // Retrieve user ID
        let postUser = await userModel.getLoginUser(req);
        let userid = postUser._id;

        // Check if user object and user_id are valid
        if (userid) {

            // Define the fields to select and join
            let select = {
                'user_id': 1,
                'title': 1,
                'description': 1,
                'file': 1,
                'status': 1,
                'type': 1,
                'created_at': 1,
                'updated_at': 1,
                'cat_id': 1
            };

            let joins = [
                {
                    path: 'cat_id',
                    select: '_id title'
                },
                {
                    path: 'user_id',
                    select: '_id first_name last_name image'
                }
            ];

            // Fetch the post details by user ID
            let where = {
                user_id: userid
            }
            if (search)
            {
                search = new RegExp(search, "i"); // Creating a case-insensitive regular expression for search
                where = {
                    $or: [
                        {
                            title: search, // Searching for posts with matching title
                        },
                        {
                            description: search, // Searching for posts with matching title
                        },
                    ],
                };
            }
            let data = await postModel.getListingbyUserID(req, select, where);

            if (data) {
                res.send({
                    status: true,
                    message: 'Data fetched successfully',
                    data: data
                });
            }
            else {
                res.send({
                    status: false,
                    message: 'No data found',
                    data: []
                });
            }
        }
        else {
            res.send({
                status: false,
                message: "User Not Found",
                error: error.message
            })
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: false,
            message: 'Something went wrong',
            error: error.message
        });
    }
};

const answerPost = async (req, res) => {
    let postUser = await userModel.getLoginUser(req);
    let userid = postUser._id;

    if (userid) {
        let select = ["author", "post_id"];

        let joins = [
            {
                path: "post_id",
                select: ["title", "description"],
            },
        ];

        let where = {
            user_id: userid,
        };

        let data = await postCommentsModel.getListing(req, select, where, joins);

        if (data) {
            res.send({
                status: true,
                message: "Data Fetch Successfully",
                data: data,
            });
        } else {
            res.send({
                status: false,
                message: "No Data Found",
                data: [],
            });
        }
    }
};

module.exports = {
    add,
    detail,
    index,
    update,
    updateStatus,
    deleteRow,
    userPost,
    featuredPost,
    answerPost,
};
