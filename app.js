const expressValidator = require('express-validator')
const express=require('express')
const path=require('path')
const bodyParser=require('body-parser')
const logger=require('morgan')
const flash=require('connect-flash')
const cookieParser=require('cookie-parser')
const session=require('express-session')
const mongo=require('mongodb')
const monk=require('monk')
const moment=require('moment')
const jade =require('jade')

const app=express()
app.locals.moment=moment
//app.locals
const db=monk('localhost/nodeblog')

const proutes=require('./router/post')
const croutes=require('./router/categories')
const iroutes=require('./router/index')

const views=path.join(__dirname,'views')
const public=path.join(__dirname,'public')

app.set('views',views)
app.set('view engine','jade')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.use(session({
    secret:'hospital',
    resave:true,
    saveUnitialized:true
}))

app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		
		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		console.log(param)
		console.log(formParam)
		
		return{
			param: formParam,
			msg: msg,
			value: value
		}
	}
}));

app.use(cookieParser())
app.use(express.static(public));

app.use(flash())
app.use(function(req,res,next){
    res.locals.messages=require('express-messages')(req,res)
    next()
})

app.use(function(req,res,next){
    req.db=db
    next()
})

app.use('/',iroutes)
app.use('/posts',proutes)
app.use('/categories',croutes)

app.use(function(req,res,next){
    var err=new Error('Not Found')
    err.status=404
    next(err)
})

if(app.get('env')==='development'){
app.use(function(err,req,res,next){
    res.status(500||err.status)
    res.render('error',{
        message:err.message,
        error:err
    })
})
}

app.use(function(err,req,res,next){
    res.status(500||err.status)
    res.render('error',{
        message:err.message,
        error:{}
    })
})

app.listen(3000,()=>{console.log("Hello")})