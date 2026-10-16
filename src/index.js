const express=  require('express')
const mongoose = require("mongoose")
const PORT = 3000;
const app = express()
const DB_USER = 'root';
const DB_PASSWORD = 'p@ssw0rd';
const DB_PORT = 27017;
const DB_HOST ='mongo'

const URL = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`;
mongoose.connect(URL).then(()=>console.log("Connected to mongo db successfully")
).catch((error)=>console.log("failed to connected to db ",error))

app.get("/",(req,res)=>res.send('<h1>Hello World </h1>'))
app.listen(PORT,'0.0.0.0',()=>console.log(`app running on port http://localhost:${PORT}`))