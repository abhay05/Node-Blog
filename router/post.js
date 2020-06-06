const express=require('express')
const router=express.Router()
const mongo=require('mongodb')
const monk=require('monk')
const db=monk('localhost/nodeblog')
const multer=require('multer')

const ObjectID=mongo.ObjectID;
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'/uploads')
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
    }

})

var upload=multer({storage,fileFilter:function(req,file,cb){
    var name=file.originalname;
    var ext=name.split('.')[1]
    if(ext==='docx' || ext==='doc'){
        cb(null,true)
    }else{
        cb(null,false)
    }
    cb('what the fuck')
}})

router.post('/upload',upload.fields({name:'post',maxCount:1}))

router.get('/',function(req,res){
    var posts=db.get('posts')
    posts.find({},{},function(err,posts){
        if(err) throw err
        res.render('index',{'title':"Posts",'posts':posts})
        console.log(posts)
    })
})

router.get('/show/:id',function(req,res){
    var posts=db.get('posts')
    var objectId=new ObjectID(req.params.id)
    posts.find({'_id':objectId},{},function(err,post){
        if(err)throw(err);
        res.render('showpost',{'title':post.title,'post':post})
    })
})



router.get('/edit/:id',function(req,res,next){
    var categories=db.get('categories')
    var posts=db.get('posts')
    var objectid=new ObjectID(req.params.id)
    categories.find({},{},function(err,post){
    posts.findOne({"_id":objectid},{},function(err,post){
        if(err)throw(err)
        res.render('editpost',{"title":post.title,"post":post,"categories":categories})
    })
})
})

router.get('/add',function(req,res,next){
    var categories=db.get('categories')
    categories.find({},{},function(err,categories){
        if(err)throw err
        res.render('addpost',{
            "title":"Add Post",
            "categories":categories
        })
    })

})

router.post('/addcomment',function(req,res,next){
    var id=req.body.postId
    var title=req.body.title
    var name=req.body.name
    var body=req.body.body
    var date=new Date()
    var posts=db.get('posts')
    var id=new ObjectID(id)

    req.checkBody('name','Enter the name').notEmpty()
    req.checkBody('title','Enter the title').notEmpty()
    req.checkBody('body','Enter the body').notEmpty()

    var err=req.validationErrors()
    if(err){
        posts.findOne({"_id":id},{},function(err,posts){
            if(err)throw err;
            res.render('showpost',{
                "title": post.title,
                "post": post,
                "errors": errors
              })
        })
    }else{
        var comment={
            "title":title,
            "name":name,
            "body":body,
            "date":date,
        }
        posts.update({"_id":id},{$push:{"comments":comment}},function(err,doc){
            if(err) throw err
            req.flash('success','Comment Added')
            res.location('posts/show/'+id)
            res.redirect('posts/show/'+id)
        })
    }
})

router.post('/add',[upload.single('thumbimage'),function(req,res,next){
    var title=req.body.title,
     category=req.body.category;
   //console.log('category ' + category)
    //name=req.body.name,
    var body=req.body.body;
    var date=new Date()

    var posts=db.get('posts')

    if(req.file){
        var oname=req.file.originalname,
            name=req.file.name,
            mime=req.file.mimetype,
            path=req.file.path,
            ext=mime.split('/')[1],
            size=req.file.size
    }else{
        name='noimage.png'
    }

    req.checkBody('title',"Title is required").notEmpty()
    req.checkBody('body',"Body is required").notEmpty()

    var err=req.validationErrors()

    if(err){
        var categories=db.get('categories')
        categories.find({},{},function(err,categories){
            if(err) throw err
            res.render('addpost', {
                "errors": errors,
                "title": title,
                "body": body,
                "categories": categories
              });
        })
    }else{
       // var posts=db.get('posts')
        posts.insert({
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "thumbimage": name
          },function(err,post){
            if(err){res.send("The post is not submitted");}
            else{
                req.flash('success','Post Submitted')
                res.location('/')
                res.redirect('/')
            }
        })
    }

}])

router.post('/edit',[upload.single('image'),function(req,res,next){
    var title=req.body.title,
    name=req.body.name,
    body=req.body.body,
    id=req.body.postId
    var ObjectId=new ObjectID(id);
    var date=new Date()

    var posts=db.get('posts')

    if(req.file){
        var oname=req.file.originalname,
            name=req.file.name,
            mime=req.file.mimetype,
            path=req.file.path,
            ext=mime.split('/')[1],
            size=req.file.size
    }else{
        name='noimage.png'
    }

    req.checkBody('title',"Title is required").notEmpty()
    req.checkBody('body',"Body is required").notEmpty()

    var err=req.validationErrors()

    if(err){
        var categories=db.get('categories')
        categories.find({},{},function(err,categories){
            if(err) throw err
            res.render('addpost', {
                "errors": errors,
                "title": title,
                "body": body,
                "categories": categories
              });
        })
    }else{
        //var posts=db.get('posts')
        posts.update({"_id":ObjectId},{
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "thumbimage": thumbImageName
          },function(err,post){
            if(err){res.send("Error in editing");}
            else{
                req.flash('success','Post Edited')
                res.location('/')
                res.redirect('/')
            }
        })
    }

}])

router.get('/delete/:id', function(req, res, next){
    var posts = db.get('posts');
    var id = new ObjectID(req.params.id);
    posts.remove({"_id": id}, function(err, post){
      if(err) throw err;
      req.flash('success', 'Post Deleted');
      res.location('/');
      res.redirect('/');
    });
});  

module.exports=router