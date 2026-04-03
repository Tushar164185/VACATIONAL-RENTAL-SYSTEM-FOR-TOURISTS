const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params: {
      folder: 'NEW FOLDER(2)',
      allowedformat:["png,jpeg,jpg"], // supports promises as well
    },
  });
  cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
  });
  module.exports={
    cloudinary,
    storage
  }