const axios = require("axios").default;
const fs = require("fs");

const util = require("./util/util");
const errorHandler = require("./error/errorHanlder");
const errors = require("./error/errors");

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
            const res = axios.head(API_POST_CALL);
            if (res.status === 200) return writeDests[API] = API_POST_CALL;

            errorHandler.noInitService(errors.SERVICE_NO_INIT_API);
        } catch (error){
            errorHandler.noInitService(errors.SERVICE_NO_INIT_API, error);
        }
    }

    if (FILE_DEST){
        if (fs.existsSync(FILE_DEST) && !fs.lstatSync(FILE_DEST).isDirectory())
            writeDests[FILE] = FILE_DEST;
        else { // Try to make a new one, if was succesful then add dest
            try {
                fs.closeSync(fs.openSync(FILE_DEST, 'w'));
                writeDests[FILE] = FILE_DEST;
            } catch (error){
                errorHandler.noInitService(errors.SERVICE_NO_INIT_FILE, error);
            }
        }
    }

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
        errorHandler.noInitService(errors.SERVICE_NO_INIT_MONGO, error);
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

// TODO THE entire scrape paylod with the selectors and time of initiation
async function _writeFile(name, value){
    const data = util.getWritingTemplate(name, value);
    try {
        util.writeData(FILE_DEST, data);
    } catch (e){
        errorHandler.timeoutOrEmptyResultOrFailureSending(errors.SERVICE_FAILURE_FILE,
            {name, value}, Date.now(), "file", e);
    }
}

async function _writeApiPost(name, value){
    try {
        const payload = {
            name: name,
            value: value
        }
        const res = await axios.post(API_POST_CALL, payload);
        if (res.status !== 200){
            errorHandler.timeoutOrEmptyResultOrFailureSending(errors.SERVICE_FAILURE_API,
                {name, value}, Date.now(), "file", "!200");
        }
    } catch (e){
        errorHandler.timeoutOrEmptyResultOrFailureSending(errors.SERVICE_FAILURE_API,
            payload, Date.now(), "api", e);
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

    } catch (e){
        errorHandler.timeoutOrEmptyResultOrFailureSending(errors.SERVICE_FAILURE_MONGO,
            {name, value}, Date.now(), "mongo", e);
    }
}
