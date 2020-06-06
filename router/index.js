const express=require('express')
const router=express.Router()


router.get('/',function(req,res,next){
    var db=req.db
    var posts=db.get('posts')
    posts.find({},{},function(err,posts){
        if(err)throw err
        res.render('index',{
            "title":"Home",
            "posts":posts
        })
    })
})

module.exports=router