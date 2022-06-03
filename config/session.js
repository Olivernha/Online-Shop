const expressSession = require('express-session');
const mongoDbStore = require('connect-mongodb-session');
function createSessionStore() {
    const MongoDBStore = mongoDbStore(expressSession);
    const store= new MongoDBStore({
        uri: process.env.MONGO_URL,
        collection: 'sessions'
    });
   return store;
}
function createSessionConfig(session) {
    const config = {
        secret: 'super-secret',
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        store: createSessionStore(session),
        cookie: {
            maxAge: 2*24*60*60*1000, // 2 days
        }
    };
    return config;
}
module.exports = createSessionConfig;