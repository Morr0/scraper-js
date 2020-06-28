const axios = require("axios").default;

const util = require("./util");

const fs = require("fs");

const {
    API_POST_CALL = undefined,
    FILE_DEST = "./data.txt",
    MONGODB_WRITE = undefined,
} = process.env;

// Indexes of writeDests
const API = 0, FILE = 1, MONGODB = 2;

let writeDests = [undefined, undefined, undefined]

// Initializes by checking the provided destinations from .env
// For REST POST CALL -> Must return 200 on a HEAD request to write
// FOR file -> Will check if it is a valid path to add it
module.exports.init = function(){
    if (API_POST_CALL){
        try {
            axios.head(API_POST_CALL)
            .then((res) => {
                if (res.status === 200) writeDests[API] = API_POST_CALL;
            });
        } catch (e){}
    }

    if (FILE_DEST){
        if (fs.existsSync(FILE_DEST) && !fs.lstatSync(FILE_DEST).isDirectory())
            writeDests[FILE] = FILE_DEST;
        else { // Try to make a new one, if was succesful then add dest
            try {
                fs.closeSync(fs.openSync(FILE_DEST, 'w'));
                writeDests[FILE] = FILE_DEST;
            } catch (e){}
        }
    }

    // TODO Handle Mongodb
}

module.exports.write = function(name, value){
    writeDests.forEach(async (element, index) => {
        if (!element) return;

        switch (index){
            case API: 

                break;
            case FILE:
                await _writeFile(name, value);
                break;
            case MONGODB:

                break;
        }
    });
}
// TODO promisify functions
async function _writeFile(name, value){
    const data = util.getWritingTemplate(name, value);
    try {
        util.writeData(FILE_DEST, data);
    } catch (e){
        console.log(e);
        // TODO handle errors
    }
}

