const multer = require("multer");
const { s3 } = require("../utils/aws");

const storage = multer.memoryStorage();

const uploader = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const upload = {
  single: (fieldName) => [
    uploader.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return next();
        }

        if (!process.env.S3_BUCKET) {
          return next(new Error("S3_BUCKET is not configured"));
        }

        const safeName = req.file.originalname.replace(/\s+/g, "-");
        const key = `${Date.now()}-${safeName}`;

        const result = await s3
          .upload({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          })
          .promise();

        req.file.location = result.Location;
        req.file.key = result.Key;
        return next();
      } catch (error) {
        return next(error);
      }
    },
  ],
};

module.exports = upload;
