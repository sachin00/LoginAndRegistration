const mongoose = require('mongoose')
const config = require('./default.json')
const db = config.mongoURI

const connectDB = async () => {
    try {
        await mongoose.connect(db)

        console.log('Connection successful...')
    }
    catch (err) {
        console.error(err.message)

        //For stopping the application
        process.exit(1)
    }
}

module.exports = connectDB