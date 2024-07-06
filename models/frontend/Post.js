const { post }   = require('../index');
const { foreach } = require('../../helper/General');

const insert = async (data) => {    
    try
    {
        let row = new post();
        row.created_at = new Date();
        
        foreach(data,(key,value)=>{
            row[key] = value
        })
        let resp = await row.save();

        if(resp)
        {
            if(resp.title)
            {
                resp.slug = resp.title.toLowerCase().replaceAll(/\s/g,'-') + resp._id;
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

const getById = async (id, select = [], joins = []) => {
    try
    {   
        let record = await post.findById(id,select);
        
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

const getRow = async (where, select = []) => {
    try
    {
        let record = await post.findOne(where, select);
        return record;
    }
    catch(error)
    {
        console.log(error)
        return false;
    }
}

const update = async (id, data) => {
    try
    {
        data.updated_at = new Date();
        let resp = await post.updateOne({"_id":id},data);
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

const getAll = async (where = {}, select = [], joins = [], orderBy = {'created_at':1}, limit = 10) => {
    try {
        let listing = await post.find(where, select)
                            .populate(joins)
                            .sort(orderBy)
                            .limit(limit);
        
        return listing;
    } catch (error) {
        console.log(error)
        return false
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
    
        let listing = post.find(where, select, {skip:offset})
                        .populate(joins)
                        .sort(orderBy)
                        .limit(limit)
    
        return listing;
    } catch (error) {
        console.log(error)
        return false
    }
}

const getCounts = async (where = {}) => {
    try
    {
        let record = await post.countDocuments(where);
        return record;
    }
    catch(error)
    {
        console.log(error)
        return false;
    }
}

const remove = async (id) => {
    try
    {
        let getRecord = await getById(id);
        if(getRecord)
        {
            let record = await post.deleteOne({'_id':id});

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
    insert,
    update,
    getById,
    getRow,
    getAll,
    getListing,
    getCounts,
    remove
};