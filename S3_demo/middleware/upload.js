const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3 } = require("../utils/aws");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    key: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

module.exports = upload;
