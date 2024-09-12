const express=require('express');
const router=express.Router();
const Author=require('../models/author');
const Book = require('../models/book');

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
        // res.redirect('authors');
        res.redirect(`authors/${newAuthor.id}`)
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

//note !!
//from the browser we only allowed to use get and post request so we need library to use put and delete request
//npm i method-override ->allowd us to take post form send that to our server with a special paramater that tell us that we are doing a 'put' or 'delete' request
//and our server would be smart enough to call the correct router for delete or put
//set the library up on server.js
router.get('/:id',async (req,res)=>{
    // res.send('Show Author ' +req.params.id);
    try {
        let author=await Author.findById(req.params.id);
        let books= await Book.find({author:author.id}).limit(6).exec();
        res.render('authors/show',{
            author:author,
            bookByAuthor:books,
        })
    } catch (error) {
        console.log(error)
    }

})
router.get('/:id/edit',async (req,res)=>{
    // res.send('Edit Author ' +req.params.id);

    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit',{
            author:author
        })
        
    } catch (error) {
        
    }
})

router.put('/:id',async (req,res)=>{  //to edit/update
    // res.send('Update Author ' +req.params.id);
    let author //putting here outside trycatch because we need the variable to be accessed inside catch
    try {
        author = await Author.findById(req.params.id);
        author.name=req.body.name;
        author.save();
        res.redirect(`/authors/${author.id}`)
        
        
    } catch (error) {
        if(author == null){
            res.redirect('/')
        }else{
            res.render('authors/edit',{
                author:author,
                errorMessage:"Error Updating The Author"
            })

        }
        
    }
})
router.delete('/:id',async (req,res)=>{ //use delete to delete data not get because google will delete every single data if u use get
    // res.send('Delete Author ' +req.params.id);
    let author //putting here outside trycatch because we need the variable to be accessed inside catch
    try {
        author = await Author.findById(req.params.id);
        await author.deleteOne(); //cek kalo ini ada di books list authornya kalo ada kasi validasi di author schema/schema.pre('remove')
        res.redirect(`/authors`)
        
        
    } catch (error) {
        if(author == null){
            res.redirect('/')
        }else{
            console.log(error);
            res.redirect(`/authors/${author.id}`)

        }
        
    }
})


module.exports=router;