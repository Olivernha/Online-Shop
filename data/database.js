const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let database;
async function connectToDatabase(){
  const client = await MongoClient.connect(process.env.MONGO_URL);
  database = client.db('online-shop-nodejs');
  console.log('Connected to database');
}
function getDb(){
    if(!database){
        throw new Error('You have not connected to database');
    }
    return database;
}
module.exports = {connectToDatabase,getDb};
