const mongoose = require('mongoose')
const config = require('config')

//DBs Config
const archive1 = process.env.MONGO_URI_1 || config.get('mongoURI1')
const archive2 = process.env.MONGO_URI_2 || config.get('mongoURI2')

// function to connect to db
const makeNewConnection = (uri, archive_db_nbr) => {

    const db = mongoose.createConnection(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false
    })

    db.on('connected', () => {
        console.log(`Mongoose connected to ${archive_db_nbr}`)
    })

    db.on('error', (err) => {
        console.log(`Mongoose connection error: ${err}`)
    })

    db.on('disconnected', () => {
        console.log(`Mongoose disconnected from ${this.name}`)
    })

    return db
}

//connect to the databases
const archive_db_1 = makeNewConnection(archive1, 'archive_db_1')
const archive_db_2 = makeNewConnection(archive2, 'archive_db_2')

// Create a schema object: If you use multiple connections, you should make sure you export schemas, not models
// The alternative to the export model pattern is the export schema pattern.

// Exporting a model from a file is called the export model pattern.
// The export model pattern is limited because you can only use one connection.
// module.exports = mongoose.model('scores30082023', ScoreSchema);

const ScoreSchema = require('../schemas/Score')
const QuizSchema = require('../schemas/Quiz')
const CategorySchema = require('../schemas/Category')
const UserSchema = require('../schemas/User')

// First is to export a connection and register the models schema on the connection in the file:
// register models by requiring schemas and calling mongoose.model(modelName, schema)
archive_db_1.model('scores30082023', ScoreSchema);
archive_db_1.model('quiz', QuizSchema);
archive_db_1.model('category', CategorySchema);
archive_db_1.model('user', UserSchema);

archive_db_2.model('scores18122023', ScoreSchema);
archive_db_2.model('quiz', QuizSchema);
archive_db_2.model('category', CategorySchema);
archive_db_2.model('user', UserSchema);

// 

// export the databases connections to be used in the routes and models
module.exports = {
    archive_db_1,
    archive_db_2
}