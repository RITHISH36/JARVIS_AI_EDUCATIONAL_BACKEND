const mongoose = require("mongoose")
// User Login (Database schema)
const UserSchema = new mongoose.Schema({
   Google_id:{type:String,required:true},
   UserName: { type: String, required: true },
   Email: { type: String, required: true },
   Profile_pic:{type:String,required:true}
})
module.exports = mongoose.model("User", UserSchema);
