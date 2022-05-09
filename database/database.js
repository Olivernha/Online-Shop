const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let database;
async function connectToDatabase(){
  const client = await MongoClient.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.fyej8.mongodb.net/online-shop-nodejs?retryWrites=true&w=majority`);
  database = client.db('online-shop');
}
function getDb(){
    if(!database){
        throw new Error('You have not connected to database');
    }
    return database;
}
module.exports = {connectToDatabase,getDb};
