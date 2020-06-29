require("dotenv").config();
const fs = require('fs');

const {
	JSON_FILE = "./sample.json"
} = process.env;

module.exports.getScrapables = function (){
    return JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
}

module.exports.writeData = function(dest, data){
    fs.writeFileSync(dest, data, {flag: "a"});
}

// Creates the template that will be written to a file
module.exports.getWritingTemplate = function(name, value){
    return `${name}: ${value} at ${Date.now()}\n`;
}