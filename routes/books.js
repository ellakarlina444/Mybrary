const express=require('express');
const router=express.Router();
const Book=require('../models/book');
const Author=require('../models/author');

const path=require('path');
const uploadPath=path.join('public',Book.coverImageBasePath)
const imageMimeTypes=['image/jpeg','image/png','image/gif']
const fs=require('fs'); //library to access file system
const multer=require('multer');
const upload=multer({
    dest:uploadPath,
    fileFilter:(req,file,callback)=>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})

//all book routes
router.get('/',async (req,res)=>{
    // res.send("all books")
    let query=Book.find();
    if(req.query.title !=null && req.query.title !=""){
        query= query.regex('title',new RegExp(req.query.title,'i'));
    }
    if(req.query.publishedBefore !=null && req.query.publishedBefore !=""){
        query= query.lte('publishDate',req.query.publishedBefore); //lte is less than or equal to publishedBefore date
    }
    if(req.query.publishedAfter !=null && req.query.publishedAfter !=""){
        query= query.lte('publishDate',req.query.publishedAfter); //lte is greater than or equal to publishedBefore date
    }
    try {
        // const books=await Book.find({}); find all books
        const books=await query.exec();
        res.render('books/index',{
            books:books,
            searchOptions:req.query,
        })
        
    } catch (error) {
        res.redirect('/')
    }
})



//new book routes
router.get('/new',async (req,res)=>{
    renderNewPage(res,new Book())
    
})
//
//create book route
router.post('/',upload.single('cover'),async (req,res)=>{ //upload.single('cover') is setting up our route to accept file by adding upload.single('cover')with the name of cover where we set it on books/_form_fields.ejs and this gonna save the file to public/uploads/bookCovers
// router.post('/',async (req,res)=>{ 
    const fileName=req.file !=null?req.file.filename:null;
    const book=new Book({
        title:req.body.title,
        author:req.body.author,
        publishDate:new Date(req.body.publishDate),
        pageNumber:req.body.pageCount,
        description:req.body.description,
        coverImageName:fileName
    });

    //note: make sure all the tabel/bookschema di folder models/book.js are the same include all the required must be field
    saveCover(book, req.body.cover)
    try {
        const newBook=await book.save();
        res.redirect(`books/${newBook.id}`)
        // res.redirect(`books`)
    } catch (error) {
        console.log(error);
        if(book.coverImageName !=null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res,book,true)
    }
})


router.get('/:id',async(req,res)=>{
    try {
        const book=await Book.findById(req.params.id).populate('author').exec();//populate is to get information like name from author collection where we pass it
        res.render('books/show',{
            book:book
        })
        
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.get('/:id/edit',async(req,res)=>{
    try {
        const book=await Book.findById(req.params.id);
        renderEditPage(res,book)
        
    } catch (error) {
        res.redirect('/')
    }
})

//create book route
router.put('/:id',async (req,res)=>{ //upload.single('cover') is setting up our route to accept file by adding upload.single('cover')with the name of cover where we set it on books/_form_fields.ejs and this gonna save the file to public/uploads/bookCovers
    //note: make sure all the tabel/bookschema di folder models/book.js are the same include all the required must be field
    let book
    try {
        book=await Book.findById(req.params.id);
        book.title=req.body.title
        book.author=req.body.author
        book.publishDate=new Date(req.body.publishDate)
        book.pageNumber=req.body.pageCount
        book.description=req.body.description
        
        if(req.body.cover !=null  && req.body.cover !=""){
            saveCover(book,req.body.cover)
        }
        await book.save();
        res.redirect(`/books/${book.id}`)
        // res.redirect(`books`)
    } catch (error) {
        if(book !=null){
            renderEditPage(res,book,true,error)
        }else{
            res.redirect('/')
        }
    }
})

router.delete('/:id',async (req,res)=>{ //use delete to delete data not get because google will delete every single data if u use get
   
    let book //putting here outside trycatch because we need the variable to be accessed inside catch
    try {
        book = await Book.findById(req.params.id);
        await book.deleteOne(); //cek kalo ini ada di books list authornya kalo ada kasi validasi di author schema/schema.pre('remove')
        res.redirect(`/books`)
        
        
    } catch (error) {
        if(book == null){
            res.redirect('/')
        }else{
            console.log(error);
            res.render(`/books/show`,{
                book:book,
                errorMessage:"Cannot Delete Book"
            })

        }
        
    }
})
//LIST OF FUNCTIONS

function removeBookCover(filename){ //to remove file upload using multer if gagal insert 
    fs.unlink(path.join(uploadPath,filename),err=>{
        if(err){
            console.error('error remove photo:',err);

        }
    })
}

async function renderEditPage(res,book,hasError=false,errorMsg){
    renderFormPage(res,book,'edit',hasError,errorMsg)
}
async function renderNewPage(res,book,hasError=false){
    renderFormPage(res,book,'new',hasError) 
}
async function renderFormPage(res,book,form,hasError=false,errorMsg){
    try {
        const authors=await Author.find({})
        const params={
            authors:authors,
            book:book
        }
        if(hasError){
            if(form==="edit"){
                params.errorMessage="Error Updating Book " +errorMsg;
            }else{
                params.errorMessage="Error Creating Book";
            }
        }
        res.render(`books/${form}`,params)
    } catch (error) {
        res.redirect("books")
    }
}
function saveCover(book, coverEncoded) {
    try {
        if (coverEncoded == null) return
        const cover = JSON.parse(coverEncoded)
        if (cover != null && imageMimeTypes.includes(cover.type)) {
          book.coverImage = new Buffer.from(cover.data, 'base64')
          book.coverImageType = cover.type
        }
        
    } catch (error) {
        console.log(error);
    }
}



module.exports=router;