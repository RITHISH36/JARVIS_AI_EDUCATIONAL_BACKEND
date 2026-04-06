require("dotenv").config()
const Jwt = require("jsonwebtoken")
const JwtToken=(req,res,next)=>{
    
         const token = req.cookies.token
        if(!token){
            res.status(401).json("User Access Denied")
        }
        try{
            const decodeToken=Jwt.verify(token,process.env.JWT_TOKEN);
            req.user = decodeToken;
            next();
        }
        catch(err){
            res.status(401).json("Invaild Token Access Denied");
        }
    }

module.exports=JwtToken;