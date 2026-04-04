require('dotenv').config({path:"./.env"});
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const model = require("./Models/listings.js");
const data=require("./init/data.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodoverride = require("method-override");
const wrapAsync = require("./util/wrapAsync.js");
const reviews=require("./Models/reviews.js");
const Reviewsalidation=require("./schema.js");
const session=require("express-session");
const mongostore=require("connect-mongo");
const cookie=require("cookies");
const flash=require("connect-flash");
const passport=require("passport");
const localPassport=require("passport-local");
const user=require("./Models/user.js");
const {isLogged,orginalUrl}=require("./Models/isLogged.js");
const { isowner,isReviewOwner } = require("./middleware.js");
const multer  = require('multer')
const {storage}=require("./cloudinary.js");
const upload = multer({storage});
const url=process.env.url;
app.use(methodoverride("_method"));
app.use(express.urlencoded({extended:true}));
app.listen("8080",(req,res)=>{
    console.log("I am listening.");
});
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
main().then(()=>{
    console.log("connected to DB");
}).catch(err => console.log(err));
async function main(){
  await mongoose.connect(url);
};
const store=
    mongostore.create({
        mongoUrl:url,
        crypto:{
            secret:process.env.secret,
        },
        touchafter:24*3600,
    })
const detail={
    store,
    secret:process.env.secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}
app.use(session(detail));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(flash());
app.use((req,res,next)=>{
    res.locals.msg=req.flash("msg","");
    res.locals.user=req.user;
    next();
})
app.get("/User",(req,res,next)=>{
    res.render("signup.ejs");
})
app.get("/login",(req,res,next)=>{
    res.render("login.ejs");
})
app.get("/logOut",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
             return next(err);
        }
    req.flash("msg","You are succesfully logout.");
    res.redirect("/");
   });
})
app.post("/loginpost",
    orginalUrl,passport.authenticate("local",{
    failureRedirect:"/login",failureFlash:true}),
    async(req,res,next)=>{
        req.flash("msg","Welcome Back!");
        let redirect=res.locals.redirectUrl||"/";
        res.redirect(redirect);
})
app.post("/signUp", async(req,res,next)=>{
    let{email,username,password}=req.body;
    let newUser=new user({email,username});
    await user.register(newUser,password);
    req.login(newUser,(err)=>{
        if(err) return next(err);
    req.flash("msg","Welcome to RoyalTravellers");
    res.redirect("/");
    })
});
app.get("/",async(req,res,next)=>{
     const data = await model.find({});
     res.render("home.ejs",{data});
})
app.delete("/show/delete/:id/:reviewid",isLogged,isReviewOwner,async(req,res,next)=>{
    let{id,reviewid}=req.params;
    await model.findByIdAndUpdate(id,{$pull:{Reviews:reviewid}});
    await reviews.findByIdAndDelete(reviewid);
    req.flash("msg","Review Deleted succesfully");
    res.redirect(`/show/${id}`);
})
app.post("/show/add",upload.single('add[image]'),async (req,res,next)=>{
    const newdata = new model({...req.body.add,owner:req.user.id});
    let url=req.file.url;
    let filename=req.file.original_filename;
    newdata.image={url,filename};
    await newdata.save();
    console.log(newdata);
    req.flash("msg","Listing added succesfully");
    res.redirect("/");
})
app.put("/edit/:id",isowner,upload.single('image.url'),async(req,res,next)=>{
    let {id} = req.params;
    let listing =await model.findByIdAndUpdate(id,{...req.body});
    console.log(req.file.path+" "+req.file.filename);
    let url=req.file.url;
    let filename=req.file.original_filename;
    listing.image={url,filename};
    await listing.save();
    req.flash("msg","Listing edit succesfully");
    //console.log(listing);
    res.redirect(`/show/${id}`);
})
app.delete("/show/delete/:id",isLogged,isowner,async(req,res,next)=>{
    let {id} = req.params;
    await model.findByIdAndDelete(id);
    req.flash("msg","Listing deleted successfully");
    res.redirect("/");
})
app.get("/show/edit/:id",isLogged,async(req,res,next)=>{
    let {id} = req.params;
    let listing = await model.findById(id);
    res.render("edit.ejs",{listing});
})
app.get("/show/new",isLogged,(req,res,next)=>{
    res.render("new.ejs");
});
app.get("/show/:id" ,async (req,res,next)=>{
    let {id} = req.params;
    let A = await model.findById(id).populate({path:"Reviews",populate:{
        path:"owner"
    }}).populate("owner");
    //console.log(A);
    res.render("particular.ejs",{A});
})
app.post("/show/:id/review",isLogged,async(req,res,next)=>{
    let listing=await model.findById(req.params.id);
    let newReview=new reviews({...req.body.review,owner:req.user.id});
    console.log(newReview);
    listing.Reviews.push(newReview);
    await listing.save();
    await newReview.save();
    req.flash("msg","Review added succesfully");
    res.redirect(`/show/${req.params.id}`);
})
const intdb= async()=>{
    let newArr=data.data.map((obj)=>{
        return ({...obj});
    })
    await model.deleteMany({});
    let listing=await model.insertMany(newArr);
    console.log(listing);
}
intdb();
app.use((err,req,res,next)=>{
    console.log(err);
    res.send("SOMETHING WENT ERROR");
})