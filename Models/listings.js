const mongoose = require("mongoose");
const schema = mongoose.Schema;
const review= require("./reviews.js");
const format = new schema({
    title:{
        type:String,
        required :true,
    },
    description:{
        type:String,
    },
    image:{
            filename:String,
            url:{
                type:String,
                default:"https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            },
    },
    price:Number,
    location:String,
    country:String,
    Reviews:[{
        type:schema.Types.ObjectId,
        ref:"reviews"
    }],
    owner:{
        type:schema.Types.ObjectId,
        ref:"users"
    }
});
format.post("findOneAndDelete",async(format)=>{
    if(format){
        await review.deleteMany({
            _id:{$in : format.Reviews}
        })
    }
})
const model = new mongoose.model("data",format);
module.exports=model;