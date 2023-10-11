// Bring in all dependencies
const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const cors = require('cors')

// Initialize express into the app variable
const app = express()

// Avoid CORS errors
app.use(cors())

// Middlewares 1.Express body parser to access request body and 2. urlencoded to access form data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//DB Config
const dbURI = process.env.MONGO_URI || config.get('mongoURI')

//connect to Mongo
const connectDB = async () => {
    await mongoose.
        connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: false
        })
        .then(() => console.log('MongoDB archive scores connected ...'),
            err => {
                console.error(`Connection error: ${err.stack}`)
                process.exit(1)
            }
        )
}

connectDB().catch(err => console.error(err))


// Bring in routes from the api
//All requests going to the api/scores30082023 goes the scores30082023 variable at the top scores30082023.js
app.use('/api/scores30082023', require('./routes/api/scores30082023'))
app.use('/', (req, res) => { res.status(200).send('Welcome to scores archive') })

//port to run on: env when deployed and 7000 when running locally
const port = process.env.PORT || 7000

app.listen(port, () => {
    console.log(`Scores archive server is listening on port ${port}`);
});