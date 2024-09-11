
//check if its running in production or not
if(process.env.NODE_ENV !=="production"){
    // require('dotenv').load();
    // require('dotenv').parse();
    require('dotenv').config(); //function work with config
}

// load the things we need
const express = require("express");
const app = express();
const expressLayout = require("express-ejs-layouts");
const bodyParser=require('body-parser');

app.set("view engine", "ejs");// set the view engine to ejs
app.set("layout", "layouts/layout"); //set seluruh layout di folder layouts/layout di dalam folder views
app.set("views", __dirname + "/views"); //set seluruh tampilan di folder views
app.use(expressLayout); //gunakan layout dengan library express-ejs-layouts
app.use(express.static('public')); //public folder dimana js style dll di public folder
app.use(bodyParser.urlencoded({limit:'10mb',extended:false}));

const indexRouter=require('./routes/index');
const authorRouter=require('./routes/authors');
const bookRouter=require('./routes/books');

const mongoose=require('mongoose');
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true}); //process.env.DATABASE_URL will be error once 
                                                            //if we havent set it up in our environment
                                                            //so set it up using dotenv in local "npm i --save-dev dotenv"
                                                            //and create file .env

const db= mongoose.connection;
db.on("error",error=>console.log(error));
db.once('open',()=>console.log('connected to mongoose')); //this will be run once

app.use('/',indexRouter);
app.use('/authors',authorRouter);//gonna be authors/  And authors/new
app.use('/books',bookRouter);//gonna be books/  And books/new
app.listen(process.env.PORT || 4000); //process.env.PORT-> the server will tell what port are we listening to. 
                                     //for development will listenn to port 3000