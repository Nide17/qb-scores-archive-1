// Bring in all dependencies
const express = require('express')
const cors = require('cors')

// Initialize express into the app variable
const app = express()

// Avoid CORS errors
app.use(cors())

// Middlewares 1.Express body parser to access request body and 2. urlencoded to access form data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Bring in routes from the api
//All requests going to the api/scores30082023 goes the scores30082023 variable at the top scores30082023.js
app.use('/api/scores30082023', require('./routes/api/scores30082023'))

// scores18122023
app.use('/api/scores18122023', require('./routes/api/scores18122023'))

app.use('/2', (req, res) => { res.status(200).send('Welcome to scores archives 2') })
app.use('/1', (req, res) => { res.status(200).send('Welcome to scores archives 1') })
app.use('/', (req, res) => { res.status(200).send('Welcome to scores archives') })

//port to run on: env when deployed and 7000 when running locally
const port = process.env.PORT || 7000

app.listen(port, () => {
    console.log(`Scores archive server is listening on port ${port}`);
});