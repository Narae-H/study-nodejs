const multer = require('multer');      // Image upload middleware
const multerS3 = require('multer-s3'); // Connect between Multer and AWS
const config = require('./../config/config.js');
const s3 = require('./../config/s3.js');

const fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.s3.bucket,
    key: function (req, file, cb) {
      cb(null, `${Date.now().toString()}_${file.originalname}`) // 업로드시 파일명
    }
  })
});

module.exports = { fileUpload };
