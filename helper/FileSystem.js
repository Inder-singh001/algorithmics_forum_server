const { writeFile, existsSync, mkdirSync } = require('fs');

const fileSystemPath = process.cwd();

const getFileNameFromPath = (path) => {
    let name = path.split('/');
    return name[(name.length)-1];
}

const getOnlyPath = (path) => {
    let name = path.split('/');
    name[(name.length)-1] = '';
    return name.join('/');
}

const uploadBase64 = async (base64Data, folderName) => {
    
    let [temp,base64] = base64Data.split(',');
    let ext = await getExtensionFromBase64(base64Data);
    
    let fileName     = `${Date.now()}.${ext}`;
    let imageBuffer  =  Buffer.from(base64, 'base64');
    let path         = null;
    
    if(folderName)
    {
        path = `uploads/${folderName}`;
    }
    else
    {
        path = `uploads`;
    }
    
    if(!existsSync(`${fileSystemPath}/${path}`))
    {
        mkdirSync(`${fileSystemPath}/${path}`)
    }

    path = `${path}/${fileName}`;    

    let uploadFile = new Promise((resolve,reject)=>{
        let returnData   = null;
        
        let callBack = async (err) => {
            if(err)
            {
                returnData = { 
                    status:false,
                    imageUrl:null,
                    message:'Error in image saving'
                };
                resolve(returnData);
            }
            else
            {
                returnData = { 
                    status:true,
                    imageUrl:path,
                    message: 'File Uploaded Successfully',
                };
                resolve(returnData);
            }
        }
        writeFile(`${fileSystemPath}/${path}`, imageBuffer, 'base64', callBack);
    })

    return await uploadFile;
}

const getExtensionFromBase64 = (base64) =>{
    let [mimeType,ext]   = base64.split(',')[0].split(';')[0].split('/');
    
    return ext;
}


module.exports = {
    getFileNameFromPath,
    getOnlyPath,
    uploadBase64
}