const { MongoClient } = require('mongodb');
const config = require('../utils/config');

let dbInstance
let client

module.exports = async function() {
    if (dbInstance) return dbInstance
    try {
        client = await new MongoClient(config.db.uri).connect();
        const db = client.db(config.db.name);
    
        cachedDb = db;
        return cachedDb;
      } catch (error) {
        console.log("ERROR aquiring DB Connection!");
        console.log(error);
        throw error;
      }
};