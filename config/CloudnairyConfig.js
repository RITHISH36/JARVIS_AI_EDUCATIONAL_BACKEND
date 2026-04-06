const cloudinary = require("cloudinary").v2
require("dotenv").config()

cloudinary.config({
  cloud_name: process.env.CLOUDNARIY_NAME,
  api_key: process.env.CLOUDNARIY_API_KEY,
  api_secret: process.env.CLOUDNARIY_API_SECRECT_KEY
}
)

module.exports = cloudinary;