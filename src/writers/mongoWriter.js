// const CronJob = require("cron").CronJob;
const cronDiff = require("cron-diff");
const cron = require("node-cron");

const util = require("../util/util");

const errorHandler = require("../error/errorHanlder");
const errors = require("../error/errors");
const { Long } = require("mongodb");

const MongoClient = require("mongodb").MongoClient;
let mongoClient = undefined;

const {
    MONGODB_URL = undefined,
    MONGODB_DATABASE = "scraper",
    MONGODB_COLLECTION="data",
    MONGODB_CONFIG
} = process.env;

// States
let customMongoConfig = undefined; // Holds the config
let currentMongoDataCollectionName = undefined;

function handleMongoError(error){
    errorHandler.noInitService(errors.SERVICE_NO_INIT_MONGO, error);
}

module.exports.init = function(){
    try {
        mongoClient = new MongoClient(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        mongoClient.connect((error) => {
            if (error) return handleMongoError(error);

            console.log("Connected to DB");

            // Find for custom configs
            customMongoConfig = util.readJSONFile(MONGODB_CONFIG);
            if (customMongoConfig){
                const db = mongoClient.db(MONGODB_DATABASE);
                createGeneralCollectionIfDoesNotExist(db);

                // Schedule cron job
                cron.schedule(customMongoConfig.newCollectionCrontime, async () => {
                    currentMongoDataCollectionName = `${Date.now()}`;

                    await db.createCollection(currentMongoDataCollectionName);

                    try {
                        await db.collection(customMongoConfig.mongoGeneralCollectionName)
                        .updateOne({}, {
                            $set: {
                                current: currentMongoDataCollectionName,
                            },
                            $push: {collections: currentMongoDataCollectionName} 
                        });
                    } catch (e){
                        console.log(e);
                        // TODO DEAL WITH THIS ERROR
                    }
                });
            }
        });

        return "a";
    } catch (e){
        console.log(e);
        handleMongoError(e);
    }
}

function createGeneralCollectionIfDoesNotExist(db){
    db.collection(customMongoConfig.mongoGeneralCollectionName, {strict: true}, async (error, collection) => {
        try {
            if (error){ // Create the collection
                // console.log("New collecition");
                currentMongoDataCollectionName = `${Date.now()}`;
    
                await db.collection(customMongoConfig.mongoGeneralCollectionName).insertOne({
                    current: currentMongoDataCollectionName,
                    collections: [
                        currentMongoDataCollectionName
                    ],
                });
            } 
            // Else since it is assumed it is there then don't do anything 


        } catch (e){
            console.log(e);
            // TODO DEAL WITH THIS ERROR
        }
    });
}

module.exports.write = async function(payload){
    try {
        const db = mongoClient.db(MONGODB_DATABASE);
        const res = await db.collection(currentMongoDataCollectionName? 
            currentMongoDataCollectionName: MONGODB_COLLECTION)
        .insertOne({
            name: payload.name,
            value: payload.values,
            epoch: Date.now(),
        });
    } catch (e){
        errorHandler.failureSending(errors.SERVICE_FAILURE_MONGO,
            payload, Date.now(), "mongo", e);
    }
}