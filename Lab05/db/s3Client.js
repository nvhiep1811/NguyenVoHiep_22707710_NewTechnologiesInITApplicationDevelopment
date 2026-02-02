const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

const S3_PUBLIC_ENDPOINT = process.env.NODE_ENV === 'production'
    ? `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`
    : "http://localhost:9000/" + process.env.S3_BUCKET;

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: "http://localhost:9000", // Cổng API của MinIO
    forcePathStyle: true,              // Bắt buộc phải có khi dùng Local/MinIO
    credentials: {
        accessKeyId: "admin",          // User trong docker-compose
        secretAccessKey: "password123" // Pass trong docker-compose
    }
    // credentials:
    //     process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    //         ? {
    //             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //         }
    //         : undefined,
});
const BUCKET = process.env.S3_BUCKET;

exports.presignProductImageUpload = async ({productId, contentType}) => {
    const ext =
        contentType === "image/png"
            ? "png"
            : contentType === "image/webp"
                ? "webp"
                : "jpg";

    const key = `products/${productId}/main.${ext}`;

    const cmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, cmd, {expiresIn: 60});

    const imageUrl = `${S3_PUBLIC_ENDPOINT}/${key}`;

    return {uploadUrl, imageUrl, key};
};

exports.uploadProductImage = async ({productId, buffer, contentType}) => {
    const ext =
        contentType === "image/png"
            ? "png"
            : contentType === "image/webp"
                ? "webp"
                : "jpg";

    const key = `products/${productId}/main.${ext}`;
    const cmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });
    await s3.send(cmd);

    const imageUrl = `${S3_PUBLIC_ENDPOINT}/${key}`;

    return {imageUrl, key};
};

exports.deleteByKey = async (key) => {
    if (!key) return;
    const cmd = new DeleteObjectCommand({Bucket: BUCKET, Key: key});
    await s3.send(cmd);
};

exports.getKeyFromUrl = (imageUrl) => {
    if (!imageUrl) return null;
    try {
        const url = new URL(imageUrl);
        return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    } catch (e) {
        return null;
    }
};
