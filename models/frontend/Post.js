const { post } = require('../index'); // Importing the 'post' model from '../index' file
const { foreach } = require('../../helper/General'); // Importing the 'foreach' function from '../../helper/General' file
const { lookup } = require('dns');

const insert = async (data) => {
    try {
        let row = new post(); // Creating a new instance of the 'post' model
        row.created_at = new Date(); // Setting the 'created_at' field to the current date and time

        foreach(data, (key, value) => { // Looping through the 'data' object using the 'foreach' function
            row[key] = value; // Assigning each key-value pair from 'data' to the corresponding field in 'row'
        });
        let resp = await row.save(); // Saving the 'row' instance to the database

        if (resp) {
            if (resp.title) {
                resp.slug = resp.title.toLowerCase().replaceAll(/\s/g, '-') + resp._id; // Generating a slug based on the 'title' field and the '_id' field
                resp.save(); // Saving the updated 'resp' instance to the database
            }
            return resp; // Returning the 'resp' instance
        }
        else {
            return false; // Returning false if 'resp' is falsy
        }
    }
    catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getById = async (id, select = [], joins = []) => {
    try {
        let record = await post.findById(id, select); // Finding a record in the 'post' collection by its '_id'

        if (joins) {
            record = record.populate(joins); // Populating the specified joins on the 'record' instance
        }

        return record; // Returning the 'record' instance
    }
    catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getRow = async (where, select = []) => {
    try {
        let record = await post.findOne(where, select); // Finding a single record in the 'post' collection that matches the specified 'where' condition
        return record; // Returning the 'record' instance
    }
    catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const update = async (id, data) => {
    try {
        data.updated_at = new Date(); // Setting the 'updated_at' field to the current date and time
        let resp = await post.updateOne({ "_id": id }, data); // Updating a record in the 'post' collection that matches the specified '_id' with the provided 'data'

        if (resp) {
            let updated = await getById(id); // Retrieving the updated record using the 'getById' function
            return updated; // Returning the updated record
        }
        else {
            return null; // Returning null if the update operation fails
        }
    }
    catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getAll = async (where = {}, select = [], joins = [], orderBy = { 'created_at': 1 }, limit = 10) => {
    try {
        let listing = await post.find(where, select)
            .populate(joins)
            .sort(orderBy)
            .limit(limit); // Retrieving multiple records from the 'post' collection based on the specified conditions

        return listing; // Returning the array of records
    } catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getListing = async (req, select = {}, where = {}, joins = []) => {
    try {
        let { sort, direction, limit, offset, page } = req.query;

        direction = direction && direction == 'asc' ? 1 : -1;
        sortField = sort ? sort : 'created_at';
        limit = limit ? parseInt(limit) : 10;
        offset = page > 1 ? ((page - 1) * limit) : 0;
        orderBy = { [sortField]: direction }

        let listing = post.find(where, select, { skip: offset })
            .populate(joins)
            .sort(orderBy)
            .limit(limit); // Retrieving multiple records from the 'post' collection based on the specified conditions

        return listing; // Returning the array of records
    } catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getListing2 = async (req, select = {}, where = {}, joins = []) => {
    try {
        let { sort, direction, limit, offset, page } = req.query;

        direction = direction && direction == 'asc' ? 1 : -1;
        sortField = sort ? sort : 'created_at';
        limit = limit ? parseInt(limit) : 10;
        offset = page > 1 ? ((page - 1) * limit) : 0;
        orderBy = { [sortField]: direction }

        // let listing = post.find(where, select, {skip:offset})
        //                 .populate(joins)
        //                 .sort(orderBy)
        //                 .limit(limit); // Retrieving multiple records from the 'post' collection based on the specified conditions

        let listing = post.aggregate([
            {
                $match: where
            },
            {
                $project: {
                    'created_at': 0
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                    "pipeline": [
                        {
                            $project: {
                                'created_at': 0
                            }
                        }
                    ]
                },

            },
            {
                $lookup: {
                    from: 'post_categories',
                    localField: 'cat_id',
                    foreignField: '_id',
                    as: 'post_categories'
                }
            },
            {
                $lookup: {
                    from: 'post_votes',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'up_votes',
                    "pipeline": [
                        {
                            $match: {
                                type: 1
                            }
                        },
                        { $group: { _id: null, count: { $sum: 1 } } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'post_votes',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'down_votes',
                    "pipeline": [
                        {
                            $match: {
                                type: 0
                            }
                        },
                        { $group: { _id: null, count: { $sum: 1 } } },
                    ]
                }
            },
            {
                $limit: limit
            },
            // {
            //     $skip:1
            // },
            {
                $sort: {
                    [sortField]: direction
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $unwind: {
                    path: "$down_votes",
                    preserveNullAndEmptyArrays: true,
                    includeArrayIndex: "down_votes_count",
                }
            },
            {
                $unwind: {
                    path: "$up_votes",
                    preserveNullAndEmptyArrays: true,
                    includeArrayIndex: "up_votes_count",
                }
            }
        ])
        return listing; // Returning the array of records
    } catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getCounts = async (where = {}) => {
    try {
        let record = await post.countDocuments(where); // Counting the number of documents in the 'post' collection that match the specified conditions
        return record; // Returning the count
    }
    catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const remove = async (id) => {
    try {
        let getRecord = await getById(id); // Retrieving a record by its '_id' using the 'getById' function

        if (getRecord) {
            let record = await post.deleteOne({ '_id': id }); // Deleting a record from the 'post' collection that matches the specified '_id'

            return record; // Returning the result of the delete operation
        }
        else {
            return false; // Returning false if the record does not exist
        }
    }
    catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getPostId = async (req) => {
    try {
        let token = await getById(req);
        if (token) {
            let record = await getRow({
                login_token: token
            }, ['_id']);

            return record;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log(error)
        return false;
    }
}

const getListingbyUserID = async (req, select = {}, where = {}, joins = []) => {
    try {
        let { sort, direction, limit, offset, page } = req.query;

        direction = direction && direction == 'asc' ? 1 : -1;
        sortField = sort ? sort : 'created_at';
        limit = limit ? parseInt(limit) : 10;
        offset = page > 1 ? ((page - 1) * limit) : 0;
        orderBy = { [sortField]: direction }


        let listing = post.aggregate([
            {
                $match: where
            },
            {
                $project: select
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                    "pipeline": [
                        {
                            $project: {
                                '_id': 1,
                                'first_name': 1,
                                'last_name': 1
                            }
                        }
                    ]
                },

            },
            {
                $lookup: {
                    from: 'post_votes',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'up_votes',
                    "pipeline": [
                        {
                            $match: {
                                type: 1
                            }
                        },
                        { $group: { _id: null, count: { $sum: 1 } } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'post_votes',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'down_votes',
                    "pipeline": [
                        {
                            $match: {
                                type: 0
                            }
                        },
                        { $group: { _id: null, count: { $sum: 1 } } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'post_comments',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'comments',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'user',
                                pipeline: [
                                    {
                                        $project: {
                                            '_id': 1,
                                            'first_name': 1,
                                            'last_name': 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                '_id': 1,
                                'user_id': 1,
                                'description': 1,
                                'created_at': 1,
                                'user': 1
                            }
                        },
                        {
                            $unwind: {
                                path: "$user",
                                preserveNullAndEmptyArrays: false
                            }
                        },
                    ]
                }
            },
            {
                $limit: limit
            },
            // {
            //     $skip:1
            // },
            {
                $sort: {
                    [sortField]: direction
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $unwind: {
                    path: "$down_votes",
                    preserveNullAndEmptyArrays: true,
                    includeArrayIndex: "down_votes_count",
                }
            },
            {
                $unwind: {
                    path: "$up_votes",
                    preserveNullAndEmptyArrays: true,
                    includeArrayIndex: "up_votes_count",
                }
            }
        ])
        return listing; // Returning the array of records
    } catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

module.exports = {
    insert,
    update,
    getById,
    getRow,
    getAll,
    getListing,
    getCounts,
    remove,
    getPostId,
    getListing2,
    getListingbyUserID
};
