const mongoose=require("mongoose")

// Ai Response and UserInput (Database schema)
const AiSchema = new mongoose.Schema({
   UserInput: { type: String, required: true },
   AiData: { type: String, required: true },
   User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   }
})

module.exports= mongoose.model("Aidata",AiSchema);