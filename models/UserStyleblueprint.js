const mongoose = require('mongoose');

const UserBluePrintSchema = mongoose.Schema({
     User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
        unique:true
    },
    PdfUserFormat: { type: String, default:"" },
    ImageUserFormat : {type: String , default:""},
},
    { timestamps: true })
module.exports = mongoose.model("UserBluePrint", UserBluePrintSchema);