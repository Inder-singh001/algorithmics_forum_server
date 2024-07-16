const { userFriends }   = require('../index'); // Importing the 'userFriends' model from '../index' file
const { foreach } = require('../../helper/General'); // Importing the 'foreach' function from '../../helper/General' file

const insert = async (data) => {    
    try
    {
        let row = new userFriends(); // Creating a new instance of the 'userFriends' model
        row.created_at = new Date(); // Setting the 'created_at' field to the current date and time
        
        foreach(data,(key,value)=>{ // Looping through the 'data' object using the 'foreach' function
            row[key] = value; // Assigning each key-value pair from 'data' to the corresponding field in 'row'
        });
        let resp = await row.save(); // Saving the 'row' instance to the database

        if(resp)
        {
            if(resp.title)
            {
                resp.slug = resp.title.toLowerCase().replaceAll(/\s/g,'-') + resp._id; // Generating a slug based on the 'title' field and the '_id' field
                resp.save(); // Saving the updated 'resp' instance to the database
            }
            return resp; // Returning the 'resp' instance
        }
        else
        {
            return false; // Returning false if 'resp' is falsy
        }
    }
    catch(error)
    {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }    
}

const getById = async (id, select = [], joins = []) => {
    try
    {   
        let record = await userFriends.findById(id,select); // Finding a record in the 'userFriends' collection by its '_id'

        if(joins)
        {
            record = record.populate(joins); // Populating the specified joins on the 'record' instance
        }

        return record; // Returning the 'record' instance
    }
    catch(error)
    {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getRow = async (where, select = []) => {
    try
    {
        let record = await userFriends.findOne(where, select); // Finding a single record in the 'userFriends' collection that matches the specified 'where' condition
        return record; // Returning the 'record' instance
    }
    catch(error)
    {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const update = async (id, data) => {
    try
    {
        data.updated_at = new Date(); // Setting the 'updated_at' field to the current date and time
        let resp = await userFriends.updateOne({"_id":id},data); // Updating a record in the 'userFriends' collection that matches the specified '_id' with the provided 'data'

        if(resp)
        {
            let updated = await getById(id); // Retrieving the updated record using the 'getById' function
            return updated; // Returning the updated record
        }
        else
        {
            return null; // Returning null if the update operation fails
        }
    }
    catch(error)
    {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getAll = async (where = {}, select = [], joins = [], orderBy = {'created_at':1}, limit = 10) => {
    try {
        let listing = await userFriends.find(where, select)
                            .populate(joins)
                            .sort(orderBy)
                            .limit(limit); // Retrieving multiple records from the 'userFriends' collection based on the specified conditions

        return listing; // Returning the array of records
    } catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getListing = async (req, select = {}, where = {}, joins = []) => {
    try {
        let {sort, direction, limit, offset, page} = req.query;
        
        direction = direction && direction == 'asc' ? 1 : -1;
        sortField = sort ? sort : 'created_at';
        limit     = limit ? parseInt(limit) : 10;
        offset    = page > 1 ? ((page-1)*limit) : 0;
        orderBy   = { [sortField]:direction }
    
        let listing = userFriends.find(where, select, {skip:offset})
                        .populate(joins)
                        .sort(orderBy)
                        .limit(limit); // Retrieving multiple records from the 'userFriends' collection based on the specified conditions

        return listing; // Returning the array of records
    } catch (error) {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const getCounts = async (where = {}) => {
    try
    {
        let record = await userFriends.countDocuments(where); // Counting the number of documents in the 'userFriends' collection that match the specified conditions
        return record; // Returning the count
    }
    catch(error)
    {
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

const remove = async (id) => {
    try
    {
        let getRecord = await getById(id); // Retrieving a record by its '_id' using the 'getById' function

        if(getRecord)
        {
            let record = await userFriends.deleteOne({'_id':id}); // Deleting a record from the 'userFriends' collection that matches the specified '_id'

            return record; // Returning the result of the delete operation
        }
        else
        {
            return false; // Returning false if the record does not exist
        }
    }
    catch(error){
        console.log(error); // Logging any errors that occur
        return false; // Returning false if an error occurs
    }
}

// const getFollower = async (id) => {
//     try
//     {   

//         let count = await userFriends.aggregate([
//             {
//                 $project:{
//                     'created_at':0
//                 }
//             },
//             {
//                 $match:{
//                     user_id:id
//                 }
//             }
            
//         ]).exec();
//         console.log(count)
//         return count
//     }
//     catch(error)
//     {
//         console.log(error)
//         return false;
//     }
// }


module.exports = { 
    insert,
    update,
    getById,
    getRow,
    getAll,
    getListing,
    getCounts,
    remove
};
