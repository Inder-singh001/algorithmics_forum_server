const postVoteModel = require("../../models/frontend/PostVote"); // Importing the PostVote model
const { validatorMake } = require("../../helper/General"); // Importing the validatorMake function
const { getById } = require("../../models/frontend/Post");
const {getLoginUserId} = require("../../models/frontend/User");

const index = async (req, res) => {
  let { search, status, from_date, end_date } = req.query; // Destructuring the query parameters
  let where = {}; // Initializing the where object

  if (search) {
    search = new RegExp(search, "i"); // Creating a regular expression for search
    where = {
      $or: [
        {
          created_at: search, // Adding the search condition to the where object
        },
      ],
    };
  }

  if (type >= 0) {
    where = {
      ...where,
      type: type, // Adding the status condition to the where object
    };
  }

  if (end_date && from_date) {
    where = {
      ...where,
      created_at: {
        $gte: new Date(from_date),
        $lte: new Date(end_date + " 23:59:59"), // Adding the date range condition to the where object
      },
    };
  } else if (end_date) {
    where = {
      ...where,
      created_at: {
        $lte: new Date(end_date + " 23:59:59"), // Adding the end date condition to the where object
      },
    };
  } else if (from_date) {
    where = {
      ...where,
      created_at: {
        $gte: new Date(from_date), // Adding the start date condition to the where object
      },
    };
  }

  let select = [
    "title",
    "user_id",
    "post_id",
    "type",
    "created_at",
    "updated_at",
    "cat_id",
  ];

  let joins = [
    {
      path: "user_id",
    },
    {
      path: "post_id",
    },
    {
      path: "cat_id",
    },
  ];

  let data = await postVoteModel.getListing(req, select, where, joins); // Fetching data from the postVoteModel
  if (data) {
    let count = await postVoteModel.getCounts(where); // Getting the count of records
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
  let { id } = req.params; // Getting the id parameter

  let select = ["user_id", "post_id", "type", "created_at", "updated_at"];
  let joins = [
    {
      path: "user_id",
    },
    {
      path: "post_id",
    },
    {
      path: "cat_id",
    },
  ];

  let data = await postVoteModel.getById(id, select, joins); // Fetching data from the postVoteModel

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
  let data = req.body; // Getting the request body
  let validatorRules = await validatorMake(data, {
    user_id: "required",
    post_id: "required",
    type: "required",
  });

  if (!validatorRules.fails()) {
    let resp = await postVoteModel.insert(data); // Inserting data into the postVoteModel
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
      message: validatorRules.errors,
    });
  }
};

const update = async (req, res) => {
  let { id } = req.params; // Getting the id parameter
  let data = req.body; // Getting the request body
  let validatorRules = await validatorMake(data, {
    type: "required",
  });

  if (!validatorRules.fails()) {
    let resp = await postVoteModel.update(id, data); // Updating data in the postVoteModel
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
      message: validatorRules.errors,
    });
  }
};

const updateStatus = async (req, res) => {
  let { id } = req.params; // Getting the id parameter
  let data = req.body; // Getting the request body
  let validatorRules = await validatorMake(data, {
    type: "required",
  });

  if (!validatorRules.fails()) {
    let resp = await postVoteModel.update(id, data); // Updating data in the postVoteModel
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
      message: validatorRules.errors,
    });
  }
};

const deleteRow = async (req, res) => {
  let { id } = req.params; // Getting the id parameter

  let resp = await postVoteModel.remove(id); // Removing the record from the postVoteModel

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

const postVote = async (req, res) => {// This function handles processing a user's vote on a post
  
  try { // Try block to catch any errors during the process
    let { post_id, type } = req.body;// Destructure post_id and type from the request body
    let user_id = await getLoginUserId(req);// Get the logged-in user's ID using getLoginUserId function (assumed to be implemented elsewhere)
    let post = await getById(post_id);// Get the post details by its ID using getById function (assumed to be implemented elsewhere)
    
    if (user_id && post) {// Check if both user and post are valid

      let data = {
        user_id: user_id._id,
        post_id: post._id,
        type: type,
      };// Prepare data object containing user ID, post ID, and vote type

      let whereCheck = {
        user_id: user_id._id,
        post_id: post._id,
      };// Define a filter object to check for existing vote

      let checkVote = await postVoteModel.getRow(whereCheck);// Check if the user already voted on this post using postVoteModel.getRow (assumed to be a model function)

        if (!checkVote) {// If no prior vote is found

          let resp = await postVoteModel.insert(data);
          // Insert the new vote data using postVoteModel.insert (assumed to be a model function)

          if (resp) 
            {// If insertion is successful
              res.send({
                status: true,
                message: "Vote Registered Successfully",
                data: resp,
              });// Send a success response with the inserted data
            }
            else 
            {// If insertion fails
              res.send({
                status: false,
                message: "Failed to register Vote",
                data: [],
              });// Send a failure response with an empty data array
            }
        } 
        else if(data.type != checkVote.type) 
        {// If a prior vote is found
          let response = await postVoteModel.update(checkVote._id,{'type':data.type});
          if (response)
            {
              res.send({
                status: true,
                message: "Updated Resposnse",
                data:response,
              });// Send a response indicating duplicate vote attempt with an empty data array
            }
            else 
            {
              res.send({
                status: false,
                message: "Failed to register Vote",
                data: [],
              });// Send a response indicating duplicate vote attempt with an empty data array
            }
        }
        else 
        {
          let resp = await postVoteModel.remove(checkVote._id);
          if(resp)
          {
            res.send({
              status: true,
              message: "Vote Deleted",
              data: [],
            });
          }
          else
          {
            res.send({
              status: false,
              message: "Something went wrong",
              data: [],
            });
          }
        }
      } 
      else 
      {// If user or post is invalid
        res.send({
          status: false,
          message: "Invalid User or Post",
          data: [],
        });// Send a response indicating invalid user or post with an empty data array
      }
    } 
    catch (error) 
    {// Catch any errors during the process
      res.send({
        status: false,
        message: "Something went wrong",
        data: [],
      });// Send a generic error response with an empty data array
    }
};

// const postVote = async (req, res) => {
//   try {
//     const { post_id, type } = req.body;
//     const user_id = await getLoginUserId(req);
//     const post = await getById(post_id);

//     if (user_id && post) {
//       const data = {
//         user_id: user_id._id,
//         post_id: post._id,
//         type: type,
//       };

//       const whereCheck = {
//         user_id: user_id._id,
//         post_id: post._id,
//       };

//       const existingVote = await postVoteModel.getRow(whereCheck);

//       if (existingVote) {
//         // Check if vote type matches and remove if so
//         if (existingVote.type === type) {
//           await postVoteModel.deleteRow(whereCheck);
//           return res.send({
//             status: true,
//             message: "Vote Removed Successfully",
//             data: null, // Indicate vote removal instead of data
//           });
//         }
//       } else {
//         const resp = await postVoteModel.insert(data);
//         if (resp) {
//           res.send({
//             status: true,
//             message: "Vote Registered Successfully",
//             data: resp,
//           });
//         } else {
//           res.send({
//             status: false,
//             message: "Failed to register Vote",
//             data: [],
//           });
//         }
//       }
//       // Insert new vote only if it's a different type or no prior vote exists
//     } else {
//       res.send({
//         status: false,
//         message: "Invalid User or Post",
//         data: [],
//       });
//     }
//   } catch (error) {
//     res.send({
//       status: false,
//       message: "Something went wrong",
//       data: [],
//     });
//   }
// };


module.exports = {
  add,
  detail,
  index,
  update,
  updateStatus,
  deleteRow,
  postVote,
};

