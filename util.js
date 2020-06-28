require("dotenv").config();
const fs = require('fs');

const {
	JSON_FILE = "./sample.json"
} = process.env;

module.exports.getScrapables = function (){
    return JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
}

module.exports.writeData = function(dest, data){
    fs.writeFileSync(dest, data);
}