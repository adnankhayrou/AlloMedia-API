require('dotenv').config()

const express = require('express');
const app = express();
const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection;
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('connected to Database'))

app.use(express.json())

// routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
app.use('/api/auth/', authRoutes)
app.use('/api/user/', userRoutes)

app.listen(3000, ()=> console.log('Server Started'))
