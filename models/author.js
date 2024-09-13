const mongoose=require('mongoose');
const Book=require('./book')
//creating schema
const authorSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
})
// authorSchema.pre('remove',function(next){//(which is deprecated)
authorSchema.pre("deleteOne", async function (next) {
        try {
            const query = this.getFilter();
            console.log(query)
            const hasBook = await Book.exists({ author: query._id });
      
            if (hasBook) {
                next(new Error("This author still has books."));
            } else {
                next();
            }
        } catch (err) {
            next(err);
        }
    });//pre is this will allow us to run method before certain action occurs and going to run any function that we put inside of here before we actually remove the author
module.exports=mongoose.model('author',authorSchema);//Author is estensial name of the table (nama tabel)
//mongo will make author as authors because it will lowercase and plular it