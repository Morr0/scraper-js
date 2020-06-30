const axios = require("axios").default;
const fs = require("fs");

const util = require("./util/util");

const MongoClient = require("mongodb").MongoClient;
let mongoClient = undefined;

const {
    API_POST_CALL = undefined,
    FILE_DEST = "./data.txt",

    // MongoDB
    MONGODB_URL = undefined,
    MONGODB_DATABASE = "scraper",
    MONGODB_COLLECTION="data",
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
    if (MONGODB_URL){
        try {
            mongoClient = new MongoClient(MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            mongoClient.connect((error) => {
                if (error) return handleMongoError(error);

                console.log("Connected to DB");
                writeDests[MONGODB] = MONGODB_URL;
            });
        } catch (e){
            handleMongoError(e);
        }
    }

    function handleMongoError(error){
        // TODO handle error
    }
}

module.exports.write = function(name, value){
    writeDests.forEach(async (element, index) => {
        if (!element) return;

        switch (index){
            case API: 
                _writeApiPost(name, value);
                break;
            case FILE:
                await _writeFile(name, value);
                break;
            case MONGODB:
                await _writeMongo(name, value);
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

async function _writeApiPost(name, value){
    try {
        const payload = {
            name: name,
            value: value
        }
        const res = await axios.post(API_POST_CALL, payload);
        // TODO handle non-200 responses
    } catch (e){
        console.log(e);
    }
}

async function _writeMongo(name, value){
    try {
        const db = mongoClient.db(MONGODB_DATABASE);
        const res = await db.collection(MONGODB_COLLECTION).insertOne({
            name: name,
            value: value,
            epoch: Date.now(),
        });

        // TODO handle failure
    } catch (e){
        console.log(e);
    }
}
