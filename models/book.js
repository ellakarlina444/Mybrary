const mongoose=require('mongoose');
const path=require('path');
//creating upload path
const coverImageBasePath='/uploads/bookCovers';

//creating schema
const bookSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    publishDate:{
        type:Date,
        required:true
    },
    pageNumber:{
        type:Number,
        required:true
    },
    createdDate:{
        type:Date,
        required:true,
        default:Date.now
    },
    coverImageName:{
        type:String,
        requred:true
    },
    coverImage:{
        type:Buffer,
        requred:true
    },
    coverImageType:{
        type:String,
        requred:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})

// bookSchema.virtual('coverImagePath').get(function(){ 
//     //this will actually derive its value from these variable and i want to called this as "coverImagePath"
//     // and just want to call the get function so when we call coverImagePath this will call the get function here
//     //the reason why we use normal function here not arrow function because we need to access "this" property which
//     //is going to link to actual book itself       
//     if(this.coverImageName != null){                   
//         return path.join('/',coverImageBasePath,this.coverImageName) //this ambil file dari folder public/uploads/bookCovers
//     }
// })

bookSchema.virtual('coverImagePath').get(function(){ 
    //this will actually derive its value from these variable and i want to called this as "coverImagePath"
    // and just want to call the get function so when we call coverImagePath this will call the get function here
    //the reason why we use normal function here not arrow function because we need to access "this" property which
    //is going to link to actual book itself       
    if(this.coverImage != null && this.coverImageType !=null){                   
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})
module.exports=mongoose.model('books',bookSchema);//Author is estensial name of the table (nama tabel)
module.exports.coverImageBasePath=coverImageBasePath;