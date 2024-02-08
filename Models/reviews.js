const mongoose = require("mongoose");
const schema = mongoose.Schema;
const formatType=new schema({
    rating:{
        type:Number,
        min:1,
        max:5
},
    Comment:{
        type:String,
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }
})
module.exports=mongoose.model("reviews",formatType);