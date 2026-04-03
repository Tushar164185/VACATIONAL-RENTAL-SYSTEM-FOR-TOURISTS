const mongoose=require("mongoose");
const LocalMongoose=require("passport-local-mongoose");
const schema=mongoose.Schema;
const signup=new schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    username:{
        type:String,
        required:true,
    }
})
signup.plugin(LocalMongoose);
module.exports=mongoose.model("users",signup);
