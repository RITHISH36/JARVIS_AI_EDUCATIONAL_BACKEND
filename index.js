require("dotenv").config();
const express = require("express")
const cookieParser = require("cookie-parser")
const app = express();
const cors = require("cors")
const mongoose = require("mongoose");
const Gemini = require("./Gemini");
const Cloudnairyservice = require("./cloud/Cloudnairyservice");
const pdfparse = require("pdf-parse");
console.log(pdfparse);
const multer = require("./middleware/Multer")()
const User = require("./models/User")
const Aidata = require("./models/Airesponse")
app.use(cookieParser());
app.use(express.json());
app.use(cors({
   origin:"http://localhost:5173",
   credentials:true
}));
const passport = require("passport");
const Jwt = require("jsonwebtoken")
const Jwt_Verification = require("./middleware/JwtToken")
const { createWorker } = require("tesseract.js")
const Auth = require("./auth/Auth")
Auth();
const Sharp = require("sharp");
const UserBluePrint = require("./models/UserStyleblueprint")
// Jwt Token for the auth 


app.use(passport.initialize())



mongoose.connect(process.env.MONGO_DB_URL)
   .then(() => console.log("Connected DB"))
   .catch(err => console.log("Not Connected to DB", err))

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { session: false }),JwtTokenGenerator);

async function JwtTokenGenerator(req, res) {
   try {
      const token = Jwt.sign(
         { id: req.user.id },
         process.env.JWT_TOKEN,
         { expiresIn: "1d" })
        res.cookie("token",token,{
         httpOnly:true,
         secure:false,
         sameSite:"Lax"
        })
        res.redirect("http://localhost:5173/ChatPage")
   }
   catch (err) {
      res.status(400).json(err)
   }
}


//  Ai Response and InputForAi
app.post("/AiResponse", Jwt_Verification, AiResponse)
async function AiResponse(req, res) {
   try {
      const { UserInput } = req.body;
      const UserId = req.user.id
      const Blueprint = await UserBluePrint.findOne({ User: UserId }).lean();
      const BlueprintFormat = Blueprint ? Blueprint.PdfUserFormat : "";
      const UserPrompt = await Gemini({ UserInput: UserInput, Blueprint: BlueprintFormat })
      const AiData = new Aidata({ UserInput: UserInput, AiData: UserPrompt, User: UserId })
      await AiData.save();
      res.status(200).json(UserPrompt)
      console.log(UserPrompt)
   }
   catch (err) {
      console.log("data erroe", err)
   }
}



// Get user Data (Api)
app.get('/Getuserdata', Jwt_Verification, Getuserdata)
async function Getuserdata(req, res) {
   try {
      const UserId = req.user.id
      const getall = await Aidata.find({ User: UserId }).populate("User")
      if (!getall) {
         throw new Error("no data")
      }
      res.status(200).json(getall)
   }
   catch (err) {
      console.log("This is data by use ", err)
   }

}



// Pdf Extract and Pdf Input (Api)
app.post("/pdf", Jwt_Verification, multer.array("file"), pdfupload)

async function pdfupload(req, res) {
   try {
      if (!req.files || req.files.length === 0) {
         return res.status(400).json("No file uploaded");
      }
      const UserId = req.user.id
      const { UserInput = "" } = req.body;
      const file = req.files[0].buffer
      const textextract = await pdfparse(file)
      const data = textextract.text
      if (!data || data.trim().length < 20) {
         return res.status(400).json("PDF has no readable text (maybe scanned)");
      }
      console.log(data)
      if (!data || typeof data !== "string") {
         throw new Error("no data found")
      }
      const pdfprompt = await Gemini({
         PdfContent: `Analyze the following academic material and extract:

1. Answer structure pattern
2. Common headings used
3. Writing tone
4. Keyword usage style
5. Typical mark-based formatting
6. How diagrams are described

Return as structured "Answer Style Blueprint".

Content:${data}`
      })
      await UserBluePrint.findOneAndUpdate(
         { User: UserId },
         { PdfUserFormat: pdfprompt },
         { upsert: true, new: true }
      )
      const upload = await Cloudnairyservice(file)
      let response = "";
      if (UserInput.trim()) {
         response = await Gemini({
            UserInput,
            PdfContent: data,
            Blueprint: pdfprompt
         })
         const AiData = new Aidata({ UserInput: UserInput, AiData: response, User: UserId })
         await AiData.save();
      }
      res.status(200).json({
         message: "sucessfully upload",
         url: upload.secure_url,
         response,
      })


   }
   catch (err) {
      res.status(400).json("err")
      console.log(err.message);
   }

}

// Image Extract And Image Input

app.post("/image", Jwt_Verification, multer.single("file"), ImgUpload)

async function ImgUpload(req, res) {
   const image = req.file.buffer;
   const UserId = req.user.id
   const folder = `jarvis_pdf/${UserId}/image`;
   try {

      if (!req.file) {
         return res.status(400).json({ message: "No image uploaded" });
      }
      if (!req.file.mimetype.startsWith("image/")) {
         return res.status(400).json({ message: "Only image files allowed" });
      }

      console.log("Image size:", req.file.size);
      console.log("Image type:", req.file.mimetype);
      const EnchanceImage = await Sharp(image)
         .resize({ width: 1200 })
         .grayscale()
         .normalize()
         .sharpen()
         .threshold(150)
         .png()
         .toBuffer();
      const worker = await createWorker('eng');
      const { data: { Imagetext } } = await worker.recognize(EnchanceImage);
      await worker.terminate();
      const upload = await Cloudnairyservice(image, folder)
      const imageprompt = await Gemini({
         ImageExtracted: `Analyze the extracted text below and identify:

- Exam answer format
- Section structure
- Keyword density
- Diagram explanation style

Extract as "Blueprint".

OCR Text: ${Imagetext}`
      });
      res.json({
         "THIS IMAGE PROMT": imageprompt,
         "THIS IMAGE EXTRACT": Imagetext
      })
      const userBlue = await UserBluePrint.findOneAndUpdate({ User: UserId },{ ImageUserFormat: imageprompt }, { upsert: true, new: true })
   }
   catch (err) {
      console.log("this is image err", err)
   }

}








app.get("/check", check)
async function check(req, res) {
   try {
      res.json(`hi ${req.user.UserName}`);
   }
   catch (err) {
      console.log(err)
   }
}

app.listen(3000, () => { console.log("server started") })
