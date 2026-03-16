# 🛍️ Product Management System với AWS S3

Ứng dụng quản lý sản phẩm với chức năng upload hình ảnh lên AWS S3.

## ✨ Tính năng

- ✅ **Thêm sản phẩm** - Tạo sản phẩm mới với tên, giá và hình ảnh
- ✅ **Xem danh sách** - Hiển thị tất cả sản phẩm
- ✅ **Sửa sản phẩm** - Cập nhật thông tin và thay đổi hình ảnh
- ✅ **Xóa sản phẩm** - Xóa sản phẩm và hình ảnh trên S3
- ✅ **Upload hình ảnh** - Tự động upload lên AWS S3

## 🚀 Cài đặt

### 1. Clone hoặc tải project

```bash
cd S3_demo
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình AWS S3

#### Bước 1: Tạo S3 Bucket

1. Đăng nhập vào [AWS Console](https://console.aws.amazon.com/)
2. Vào **S3** service
3. Click **Create bucket**
4. Nhập tên bucket (ví dụ: `nodejs-product-images-demo`)
5. Chọn Region (ví dụ: `ap-southeast-1` - Singapore)
6. **Object Ownership**: Chọn **ACLs disabled (recommended)**
7. **Block Public Access settings**: Bỏ chọn **Block all public access** (để cho phép public read)
8. Xác nhận cảnh báo về public access
9. Click **Create bucket**

#### Bước 2: Cấu hình Bucket Policy

1. Vào bucket vừa tạo
2. Tab **Permissions** → **Bucket Policy**
3. Thêm policy sau (thay `your-bucket-name` bằng tên bucket của bạn):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

**Lưu ý**: Policy này cho phép mọi người xem (read) các file trong bucket, nhưng không thể upload hay xóa.

#### Bước 3: Lấy AWS Credentials

1. Vào **IAM** service
2. **Users** → Chọn user hoặc tạo user mới
3. **Permissions** → **Add permissions** → **Attach policies directly**
4. Chọn **AmazonS3FullAccess** hoặc tạo policy tùy chỉnh với quyền:
   - `s3:PutObject` (upload file)
   - `s3:GetObject` (đọc file)
   - `s3:DeleteObject` (xóa file)
5. **Security credentials** → **Create access key**
6. Chọn **Application running outside AWS**
7. Lưu lại **Access Key ID** và **Secret Access Key**

**Policy tùy chỉnh** (thay `your-bucket-name`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 4. Cấu hình môi trường

Tạo file `.env` từ file mẫu:

```bash
Copy-Item .env.example .env
```

Sau đó mở file `.env` và điền thông tin AWS của bạn:

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=abc123...
AWS_REGION=ap-southeast-1
S3_BUCKET=nodejs-product-images-demo
PORT=3000
```

### 5. Chạy ứng dụng

```bash
node app.js
```

Mở trình duyệt và truy cập: `http://localhost:3000`

## 📁 Cấu trúc Project

```
S3_demo/
├── app.js                      # Entry point
├── package.json                # Dependencies
├── .env.example               # Environment variables mẫu
├── config/
│   └── s3.js                  # Cấu hình AWS S3
├── controllers/
│   └── productControllers.js  # Logic xử lý CRUD
├── middleware/
│   └── upload.js              # Middleware upload file lên S3
├── models/
│   └── productModel.js        # Model sản phẩm (in-memory)
├── routes/
│   └── productRoutes.js       # Định nghĩa routes
└── views/
    └── product.ejs            # Giao diện hiển thị
```

## 🎯 Các Routes

| Method | Route                  | Mô tả                       |
| ------ | ---------------------- | --------------------------- |
| GET    | `/` hoặc `/products`   | Hiển thị danh sách sản phẩm |
| GET    | `/products/new`        | Form thêm sản phẩm mới      |
| POST   | `/products`            | Tạo sản phẩm mới            |
| GET    | `/products/edit/:id`   | Form sửa sản phẩm           |
| POST   | `/products/update/:id` | Cập nhật sản phẩm           |
| POST   | `/products/delete/:id` | Xóa sản phẩm                |

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **EJS** - Template engine
- **AWS S3** - Cloud storage
- **Multer** - File upload
- **Multer-S3** - Upload trực tiếp lên S3
- **AWS SDK** - AWS services integration

## 📝 Lưu ý

1. **Bảo mật**: Không commit file `.env` lên Git
2. **Bucket Policy**: Đảm bảo bucket đã public để xem được ảnh
3. **Region**: Phải khớp region giữa bucket và config
4. **IAM Permissions**: User cần có quyền S3:PutObject, S3:DeleteObject, S3:GetObject
5. **Data Storage**: Hiện tại dùng in-memory, khởi động lại server sẽ mất data

## 🔒 Bảo mật Best Practices

1. Không public AWS credentials
2. Sử dụng IAM user riêng với quyền giới hạn
3. Enable versioning trên S3 bucket
4. Cân nhắc sử dụng CloudFront cho caching
5. Thêm validation cho file upload (size, type)

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra file `.env` đã đúng chưa
2. Kiểm tra bucket policy đã public chưa
3. Kiểm tra IAM user có đủ quyền S3 chưa
4. Xem console log để debug

## 📄 License

MIT License - Học tập và phát triển tự do!
