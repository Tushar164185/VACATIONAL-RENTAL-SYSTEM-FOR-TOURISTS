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
const validateschema=(req,res,next)=>{
    let error=Reviewsalidation.validates(req.body);
    if(error);
    else next();
}
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
  await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
};
const initDb =async()=>{
    await model.insertMany(data.data);
    console.log("Date was saved.")
}
app.get("/show",async(req,res)=>{
     const data = await model.find({});
     res.render("home.ejs",{data});
})
app.delete("/show/delete/:id/:reviewid",async(req,res)=>{
    let{id,reviewid}=req.params;
    await model.findByIdAndUpdate(id,{$pull:{Reviews:reviewid}});
    await reviews.findByIdAndDelete(reviewid);
    res.redirect(`/show/${id}`);
})
app.post("/show/add",wrapAsync(async (req,res,next)=>{
    const newdata = new model(req.body.add);
    console.log(newdata);
    await newdata.save();
    res.redirect("/show");
}))
app.put("/edit/:id",async(req,res)=>{
    let {id} = req.params;
    await model.findByIdAndUpdate(id,{...req.body});
    res.redirect("/show");
})
app.delete("/show/delete/:id", async(req,res)=>{
    let {id} = req.params;
    await model.findByIdAndDelete(id);
    res.redirect("/show");
})
app.get("/show/edit/:id",async(req,res)=>{
    let {id} = req.params;
    let listing = await model.findById(id);
    res.render("edit.ejs",{listing});
})
app.get("/show/new",(req,res)=>{
    res.render("new.ejs");
});
app.get("/show/:id" ,async (req,res)=>{
    let {id} = req.params;
    let A = await model.findById(id).populate("Reviews");
    res.render("particular.ejs",{A});
})
app.post("/show/:id/review",async(req,res)=>{
    let listing=await model.findById(req.params.id);
    let newReview=  new reviews(req.body.review);
    listing.Reviews.push(newReview);
    await listing.save();
    await newReview.save();
    res.redirect(`/show/${req.params.id}`);
})
app.use((err,req,res,next)=>{
    console.log(err);
    res.send("SOMETHING WENT ERROR");
})



