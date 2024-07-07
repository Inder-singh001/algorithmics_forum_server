const { user }   = require('../index');
const { foreach } = require('../../helper/General');

// Function to insert a new user record
const insert = async (data) => {    
    try
    {
        let row = new user();
        row.created_at = new Date();
        
        foreach(data,(key,value)=>{
            row[key] = value
        })
        let resp = await row.save();

        if(resp)
        {
            if(resp.first_name)
            {
                resp.slug = resp.first_name.toLowerCase().replaceAll(/\s/g,'-') + resp._id;
                resp.save()
            }
            return resp;
        }
        else
        {
            return false;
        }
    }
    catch(error)
    {
        console.log(error)
        return false;
    }    
}

// Function to get a user record by ID
const getById = async (id, select = [], joins = []) => {
    try
    {   
        let record = await user.findById(id,select);
        
        if(joins)
        {
            record = record.populate(joins)
        }

        return record;
    }
    catch(error)
    {
        console.log(error)
        return false;
    }
}

// Function to get a single user record based on a condition
const getRow = async (where, select = []) => {
    try
    {
        let record = await user.findOne(where, select);
        return record;
    }
    catch(error)
    {
        console.log(error)
        return false;
    }
}

// Function to update a user record
const update = async (id, data) => {
    try
    {
        data.updated_at = new Date();
        let resp = await user.updateOne({"_id":id},data);
        if(resp)
        {
            let updated = await getById(id);
            return updated;
        }
        else
        {
            return null;
        }
    }
    catch(error)
    {
        console.log(error)
        return false;
    }
}

// Function to get all user records
const getAll = async (where = {}, select = [], joins = [], orderBy = {'first_name':1}, limit = 10) => {
    try {
        let listing = await user.find(where, select)
                            .populate(joins)
                            .sort(orderBy)
                            .limit(limit);
        
        return listing;
    } catch (error) {
        console.log(error)
        return false
    }
}

// Function to get a paginated listing of user records
const getListing = async (req, select = {}, where = {}, joins = []) => {
    try {
        let {sort, direction, limit, offset, page} = req.query;
        
        direction = direction && direction == 'asc' ? 1 : -1;
        sortField = sort ? sort : 'created_at';
        limit     = limit ? parseInt(limit) : 10;
        offset    = page > 1 ? ((page-1)*limit) : 0;
        orderBy   = { [sortField]:direction }
    
        let listing = user.find(where, select, {skip:offset})
                        .populate(joins)
                        .sort(orderBy)
                        .limit(limit)
    
        return listing;
    } catch (error) {
        console.log(error)
        return false
    }
}

// Function to get the count of user records based on a condition
const getCounts = async (where = {}) => {
    try
    {
        let record = await user.countDocuments(where);
        return record;
    }
    catch(error)
    {
        console.log(error)
        return false;
    }
}

// Function to remove a user record
const remove = async (id) => {
    try
    {
        let getRecord = await getById(id);
        if(getRecord)
        {
            let record = await user.deleteOne({'_id':id});

            return record;
        }
        else
        {
            return false;
        }
    }
    catch(error){
        console.log(error)
        return false;
    }
}

module.exports = { 
    insert, // Insert a new user record
    update, // Update a user record
    getById, // Get a user record by ID
    getRow, // Get a single user record based on a condition
    getAll, // Get all user records
    getListing, // Get a paginated listing of user records
    getCounts, // Get the count of user records based on a condition
    remove // Remove a user record
};