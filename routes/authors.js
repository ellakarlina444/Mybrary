const express=require('express');
const router=express.Router();
const Author=require('../models/author');

//ALL AUTHORS ROUTE
router.get('/',async (req,res)=>{
    let searchOptions={};
    if(req.query.name !== null && req.query.name !== ""){
        searchOptions.name=new RegExp(req.query.name,'i');//'i'= (tidak case sensitive),contohnya  jadi nyari nama john, kalo search jo bakal muncul
    }
    try {
        const authors= await Author.find(searchOptions);//select * from tabel authors
        res.render('authors/index',{
            authors:authors,
            searchOptions:req.query
        });
    } catch (error) {
        res.redirect('/');
    }
})

//new author routes
router.get('/new',(req,res)=>{
    res.render('authors/new',{
        author:new Author()
    })
})
//
//create author route
router.post('/',async (req,res)=>{

    
    const author=new Author({
        name:req.body.name
    }); 
    try{
        const newAuthor=await author.save();
        res.redirect('authors');
    }catch(error){
        res.render('authors/new',{
            author:author,
            errorMessage:"Error Creating Author= " + author.name + ' =' + error
        })
    }
    //this method is not using async await
    // author.save().then((exx)=>{
    //     console.log('sukses');
    //     // res.redirect(`authors/${newAuthor.id}`)
    //     res.redirect('authors');
    // }).catch((err)=>{
    //     console.log(err);
    //     res.render('authors/new',{
    //         author:author,
    //         errorMessage:"Error Creating Author= " + author.name
    //     })
    // })
    // res.send(req.body)
})

module.exports=router;