const model=require("./Models/listings.js");
const review=require("./Models/reviews.js");
module.exports.isowner= async(req,res,next)=>{
    let {id}=req.params;
    let listing= await model.findById(id);
    if(listing.owner.equals(res.locals.user.id)){
        next();
    }
    else{
        req.flash("msg","You are not owner of this listing");
        res.redirect(`/show/${id}`);
    }
}
module.exports.isReviewOwner= async(req,res,next)=>{
    let {id,reviewid}=req.params;
    let Review= await review.findById(reviewid);
    if(Review.owner.equals(res.locals.user.id)){
        next();
    }
    else{
        req.flash("msg","You are not owner of this Review");
        res.redirect(`/show/${id}`);
    }
}