const express=require('express')
const router=express.Router()


router.get('/add',function(req,res,next){
    res.render('addcategory', {
        title: "Add Category"
      });

})

router.post('/add',function(req,res,next){
    var db=req.db
    var categories=db.get('categories')
    var title=req.body.title
    req.checkBody('title',"Not Empty").notEmpty()
    var err=req.validationErrors();
    if(err){
        //res.send("Category Not Added")
        res.render('/addcategory',{
            'title':'Add Category',
            'errors':err
        })
    }
    else{
        categories.insert({"title":title},function(err,title){
            if(err) res.send("Category Not Added")
            req.flash('success','Category Added')
            res.location('/categories')
            res.redirect('/categories')
        })
    }
})


module.exports=router