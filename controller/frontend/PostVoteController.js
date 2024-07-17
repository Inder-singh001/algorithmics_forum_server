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

const postVote = async (req, res) => {
    try {
        let { post_id, type } = req.body;
        let user_id = await getLoginUserId(req);
        let post = await getById(post_id);

        if (user_id && post) {
            let data = {
                user_id: user_id._id,
                post_id: post._id,
                type: type,
            };

            let whereCheck = {
                user_id: user_id._id,
                post_id: post._id
            }
            let checkVote = await postVoteModel.getRow(whereCheck);

            if (!checkVote) {
                let resp = await postVoteModel.insert(data);

                if (resp) {
                    res.send({
                        status: true,
                        message: "Vote Registered Successfully",
                        data: resp,
                    });
                } else {
                    res.send({
                        status: false,
                        message: "Failed to register Vote",
                        data: [],
                    });
                }
            } 
            else {
                res.send({
                    status: false,
                    message: "Cannot make duplicate Votes",
                    data: [],
                });
            }
        } else {
            res.send({
                status: false,
                message: "Invalid User or Post",
                data: [],
            });
        }
    } catch (error) {
        res.send({
            status: false,
            message: "Something went wrong",
            data: [],
        });
    }
};


module.exports = {
  add,
  detail,
  index,
  update,
  updateStatus,
  deleteRow,
  postVote,
};
