const postCommentsModel = require("../../models/frontend/PostComments"); // Importing the Post Comments model
const { postCategory } = require("../../models/index"); // Importing the postCategory model
const { getById } = require("../../models/frontend/Post");
const userModel = require("../../models/frontend/User");
const { validatorMake } = require("../../helper/General"); // Importing the validatorMake function
// const { populate } = require("dotenv"); // Importing the populate function from dotenv

const index = async (req, res) => {
  let { search, status, from_date, end_date } = req.query; // Destructuring the query parameters
  let where = {};

  if (search) {
    search = new RegExp(search, "i"); // Creating a case-insensitive regular expression for search
    where = {
      $or: [
        {
          post_id: search, // Searching for posts with matching title
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

  let select = ["user_id", "post_id", "description", "parent_id", "created_at"];

  let joins = [
    {
      path: "post_id",
    },
    {
      path: "user_id",
    },
    {
      path: "parent_id",
    },
  ];

  let data = await postCommentsModel.getListing(req, select, where, joins); // Fetching posts based on the filters
  if (data) {
    let count = await postCommentsModel.getCounts(where); // Getting the count of posts based on the filters
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

  let select = ["user_id", "post_id", "description", "parent_id", "created_at"];

  let joins = [
    {
      path: "post_id",
    },
    {
      path: "user_id",
    },
    {
      path: "parent_id",
    },
  ];

  let data = await postCommentsModel.getById(id, select, joins); // Fetching the post details by ID

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
  let data = req.body; // Getting the post data from the request body
  let validatorRules = await validatorMake(data, {
    user_id: "required",
    post_id: "required",
    description: "required", // Validating that the title field is required
  });

  if (!validatorRules.fails()) {
    let resp = await postCommentsModel.insert(data); // Inserting the post data into the database
    if (resp) {
      res.send({
        status: true,
        message: "Record Saved Successfully",
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

// const update = async (req, res) => {
//     let {id} = req.params; // Getting the post ID from the request parameters
//     let data = req.body; // Getting the updated post data from the request body
//     let validatorRules = await validatorMake(
//         data,
//         {
//             "title": "required",
//             "description":"required",
//             "type":"required" ,  // Validating that the first_name field is required
//         }
//     );

//     if(!validatorRules.fails())
//     {
//         let resp = await postCommentsModel.update(id,data); // Updating the post data in the database
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
//         let resp = await postCommentsModel.update(id,data); // Updating the post status in the database
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
  let { id } = req.params; // Getting the post ID from the request parameters

  let resp = await postCommentsModel.remove(id); // Deleting the post from the database

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

const userPostAnswer = async (req, res) => {
  let postUser = await userModel.getLoginUserId(req);
  let userid = postUser._id;

  if (userid) {
    let select = ["user_id", "post_id", "description", "created_at"];

    let joins = [
      {
        path: "post_id",
        select: ["title"],
      },
    ];

    let where = {
      user_id: userid,
    };
    let data = await postCommentsModel.getListing(req, select, where, joins);
    let count = await postCommentsModel.getCounts(where);

    if (data) {
      res.send({
        status: true,
        message: "Data Fetch Successfully",
        total: count,
        data: data,
      });
    } else {
      res.send({
        status: false,
        message: "No Data Found",
        data: [],
      });
    }
  } else {
    res.send({
      status: false,
      message: "User Not Found",
      error: error.message,
    });
  }
};

const getpostComments = async (req, res) => {
  let { postId } = req.params;

  let select = ["user_id", "description", "created_at"];

  let where = {
    post_id: postId,
  };

  let data = await postCommentsModel.getListing(req, select, where);

  if (data) {
    res.send({
      status: true,
      message: "Data Fetch Successfully",
      data: data,
    });
  } else {
    res.send({
      status: false,
      message: "Post Not Found",
      data: [],
    });
  }
};

const addComments = async (req, res) => {

  let commentUser = await userModel.getLoginUserId(req)
  let userId = commentUser ? commentUser._id : null

  let data = req.body; // Getting the post data from the request body
  if (userId) {
    let validatorRules = await validatorMake(data, {
      user_id: "required",
      post_id: "required",
      description: "required", // Validating that the title field is required
    });
    
    data.user_id = userId

    if (!validatorRules.fails()) {
      let resp = await postCommentsModel.insert(data); // Inserting the post data into the database
      if (resp) {
        let select = [
          '_id',
          'user_id',
          'description',
          'created_at'
        ];
        let joins = [
          {
            path:'user_id',
            select:[
              '_id',
              'first_name',
              'last_name'
            ],
          }
        ]
        let getComment = await postCommentsModel.getById(resp._id, select, joins)
        res.send({
          status: true,
          message: "Comment added hh",
          data: getComment,
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
  }
  else {
    res.send({
      status: false,
      message: "user not found", // Sending validation errors if any
    });
  }
}

module.exports = {
  add,
  detail,
  index,
  deleteRow,
  userPostAnswer,
  getpostComments,
  addComments
};
