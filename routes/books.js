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
        console.log(file);
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
    console.log(query);
    try {
        // const books=await Book.find({}); find all books
        const books=await query.exec();
        res.render('books/index',{
            books:books,
            searchOptions:req.query
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
    console.log(fileName);
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
        console.log(book);
        const newBook=await book.save();
        console.log(newBook);
        //res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch (error) {
        if(book.coverImageName !=null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res,book,true)
    }
})

function removeBookCover(filename){ //to remove file upload using multer if gagal insert 
    fs.unlink(path.join(uploadPath,filename),err=>{
        if(err){
            console.error('error remove photo:',err);

        }
    })
}

async function renderNewPage(res,book,hasError=false){
    try {
        const authors=await Author.find({})
        const params={
            authors:authors,
            book:book
        }
        if(hasError)params.errorMessage="Error Creating Book";
        res.render("books/new",params)
    } catch (error) {
        res.redirect("books")
    }
}
function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType = cover.type
    }
  }
module.exports=router;