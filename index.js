const express = require('express')
const connectDB = require('./config/db')

const app = express()

// Connect Database
connectDB()

// Initialising middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) => {
    res.send('API running...')
})

// Define Routes
app.use('/api/v1', require('./routes/api/users'))
app.use('/api/articles', require('./routes/api/articles'))

const PORT = process.env.PORT || 5555
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))