const mongoose=require('mongoose');

//creating schema
const authorSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
})
module.exports=mongoose.model('authors',authorSchema);//Author is estensial name of the table (nama tabel)