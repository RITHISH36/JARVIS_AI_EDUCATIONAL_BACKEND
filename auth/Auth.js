require("dotenv").config()
const passport=require("passport");
const GoogleStaretgy=require("passport-google-oauth20").Strategy
const mongoose=require("mongoose");
const User = require("../models/User");
const Auth=()=>{

    passport.use(
        new GoogleStaretgy(
            {
                clientID:process.env.GOOGLE_CLIENT_ID,
                clientSecret:process.env.GOOGLE_CLIENT_SECRECT,
                callbackURL:"https://jarvis-ai-educational-backend.onrender.com/auth/google"
            },
            async (accessToken,refreshToken,profile,done) =>{
                try{
                    let user=await User.findOne({Google_id:profile.id})

                    if(!user){
                       user= new User({
                        Google_id:profile.id,
                         UserName:profile.displayName,
                         Email:profile.emails[0].value,
                         Profile_pic:profile.photos[0].value
                      })
                      await user.save();
                    }
                    done(null,user);
                }
                catch (err){
                       done(err,null);
                }
            }
        )
    );
    passport.serializeUser((user,done)=>{
        done(null,user.id)
    });
    passport.deserializeUser(async(id,done)=>{
        const user=await User.findById(id);
        done(null,user)
    })
}

module.exports=Auth;