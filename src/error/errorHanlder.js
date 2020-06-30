const aws = require("aws-sdk");

const {
    AWS_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY,
    AWS_QUEUE_LOCATION,
    AWS_QUEUE_URL,
} = process.env;

// Aws SQS
if (AWS_QUEUE_LOCATION) aws.config.update({region: AWS_QUEUE_LOCATION});
const sqs = new aws.SQS({
    apiVersion: "2012-11-05",

    accessKeyId: AWS_ACCESS_KEY? AWS_ACCESS_KEY: accessKeyId,
    secretAccessKey: AWS_SECRET_ACCESS_KEY? AWS_SECRET_ACCESS_KEY: secretAccessKey,
});

module.exports.test = function(){
    sendMessage({
        DelaySeconds: 10,
        QueueUrl: AWS_QUEUE_URL,

        MessageBody: "Hello there"
    });
}

module.exports.timeoutOrEmptyResult = function(errorCode, scrapePayload, time){
    const message = {
        DelaySeconds: 10,
        QueueUrl: AWS_QUEUE_URL,
        
        MessageBody: JSON.stringify({
            errorCode: errorCode,
            scrapePayload: scrapePayload,
            time: time,
        }),
      };
 
      sendMessage(message);
}

module.exports.failureSending = 
function(errorCode, scrapePayload, time, sendingMethod, error){
    const message = {
       DelaySeconds: 10,
       QueueUrl: AWS_QUEUE_URL,
       
       MessageBody: JSON.stringify({
           errorCode: errorCode,
           scrapePayload: scrapePayload,
           sendingMethod: sendingMethod,
           time: time,
           error: error,
       }),
     };

     sendMessage(message);
}

// For the errors in initialization
module.exports.noInitService = function(errorCode, error = {}){
    const message = {
        DelaySeconds: 10,
        QueueUrl: AWS_QUEUE_URL,

        MessageBody: JSON.stringify({
            errorCode: errorCode,
            error: error,
        }),
    };

    sendMessage(message);
}

function sendMessage(message){
    sqs.sendMessage(message, (error, data) => {
        if (error) return console.log("Error in queueing");
     });
}



