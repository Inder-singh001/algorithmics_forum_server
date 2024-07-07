const { postComments } = require('../index');
const { foreach } = require('../../helper/General');

// Function to insert a new post comment
const insert = async (data) => {    
    try {
        let row = new postComments();
        row.created_at = new Date();
        
        foreach(data, (key, value) => {
            row[key] = value;
        });

        let resp = await row.save();

        if (resp) {
            if (resp.title) {
                resp.slug = resp.title.toLowerCase().replaceAll(/\s/g, '-') + resp._id;
                resp.save();
            }
            return resp;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }    
};

// Function to get a post comment by its ID
const getById = async (id, select = [], joins = []) => {
    try {   
        let record = await postComments.findById(id, select);
        
        if (joins) {
            record = record.populate(joins);
        }

        return record;
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Function to get a single post comment based on a condition
const getRow = async (where, select = []) => {
    try {
        let record = await postComments.findOne(where, select);
        return record;
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Function to update a post comment
const update = async (id, data) => {
    try {
        data.updated_at = new Date();
        let resp = await postComments.updateOne({ "_id": id }, data);
        if (resp) {
            let updated = await getById(id);
            return updated;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Function to get all post comments based on a condition
const getAll = async (where = {}, select = [], joins = [], orderBy = { 'created_at': 1 }, limit = 10) => {
    try {
        let listing = await postComments.find(where, select)
                            .populate(joins)
                            .sort(orderBy)
                            .limit(limit);
        
        return listing;
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Function to get a paginated listing of post comments
const getListing = async (req, select = {}, where = {}, joins = []) => {
    try {
        let { sort, direction, limit, offset, page } = req.query;
        
        direction = direction && direction == 'asc' ? 1 : -1;
        sortField = sort ? sort : 'created_at';
        limit = limit ? parseInt(limit) : 10;
        offset = page > 1 ? ((page - 1) * limit) : 0;
        orderBy = { [sortField]: direction };
    
        let listing = postComments.find(where, select, { skip: offset })
                        .populate(joins)
                        .sort(orderBy)
                        .limit(limit);
    
        return listing;
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Function to get the count of post comments based on a condition
const getCounts = async (where = {}) => {
    try {
        let record = await postComments.countDocuments(where);
        return record;
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Function to remove a post comment by its ID
const remove = async (id) => {
    try {
        let getRecord = await getById(id);
        if (getRecord) {
            let record = await postComments.deleteOne({ '_id': id });
            return record;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

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
