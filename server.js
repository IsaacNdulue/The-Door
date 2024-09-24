const express = require('express')
const mongoose = require('mongoose')
const userRouter = require ('./routers/userRouter')
// const adminRouter = require ('./router/adminRouter')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors({origin:"*"}))
app.use(express.json())

// app.use('/uploads', express.static('uploads'));

// // Set up session middleware
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable for secret
//     resave: false, // Don't resave session if unmodified
//     saveUninitialized: true, // Create a session if none exists
//     store: sessionStore, // Store sessions in MySQL
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24 // Session expiration (1 day)
//     }
//   }));


app.use('/api/user', userRouter) 
// app.use('/api/admin', adminRouter) 


const port = process.env.port
const db = process.env.DB

mongoose.connect(db).then(()=>{
    console.log('database connection established')
    app.listen(port,()=>{
        console.log(`Server listening on ${port}`)
    })
}).catch((error)=>{ 
    console.log(`database unable to connect ${error}`)
})