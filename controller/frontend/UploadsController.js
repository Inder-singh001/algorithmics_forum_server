const { uploadBase64 } = require('../../helper/FileSystem')

const upload = async (req, res) => {
    let {image, folder_name} = req.body;
    
    if(image)
    {
        let uploadResp = await uploadBase64(image, folder_name)
        if(uploadResp.status)
        {
            res.json({
                status: uploadResp.status,
                imageUrl:uploadResp.imageUrl,
                message: uploadResp.message
            });
        }
        else
        {
            res.json({
                status: false,
                message: uploadResp.message
            });
        }
    }
    else
    {
        res.json({
            status: false,
            message: 'Image Field Required'
        });
    }
};

module.exports = { upload };