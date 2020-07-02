const fetch = require("node-fetch");
const fs = require("fs");

const util = require("./util/util");
const errorHandler = require("./error/errorHanlder");
const errors = require("./error/errors");

// Writers
const mongoWriter = require("./writers/mongoWriter");

const {
    API_POST_CALL = undefined,
    FILE_DEST = "./data.txt",
    MONGODB_URL = undefined,
} = process.env;

// Indexes of writeDests
const API = 0, FILE = 1, MONGODB = 2;

let writeDests = [undefined, undefined, undefined]

// Initializes by checking the provided destinations from .env
// For REST POST CALL -> Must return 200 on a HEAD request to write
// FOR file -> Will check if it is a valid path to add it
module.exports.init = function(){
    if (API_POST_CALL){
        fetch(API_POST_CALL, {method: "HEAD"})
        .then((res) => {
            if (res.status === 200) return writeDests[API] = API_POST_CALL;
        }).catch((error) => {
            errorHandler.noInitService(errors.SERVICE_NO_INIT_API, error);
        });
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
        if (mongoWriter.init() === "a")
            writeDests[MONGODB] = MONGODB_URL;
    }
}

module.exports.write = function(payload){
    writeDests.forEach(async (element, index) => {
        if (!element) return;

        switch (index){
            case API: 
                _writeApiPost(payload);
                break;
            case FILE:
                await _writeFile(payload);
                break;
            case MONGODB:
                await mongoWriter.write(payload);
                break;
        }
    });
}

async function _writeFile(payload){
    const data = util.getWritingTemplate(payload.name, JSON.stringify(payload.values));
    try {
        util.writeData(FILE_DEST, data);
    } catch (e){
        errorHandler.failureSending(errors.SERVICE_FAILURE_FILE,
            payload, Date.now(), "file", e);
    }
}

async function _writeApiPost(payload){
    try {
        const res = await fetch(API_POST_CALL, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        if (res.status !== 200){
            errorHandler.failureSending(errors.SERVICE_FAILURE_API,
                payload, Date.now(), "file", "!200");
        }
    } catch (e){
        errorHandler.failureSending(errors.SERVICE_FAILURE_API,
            payload, Date.now(), "api", e);
    }
}