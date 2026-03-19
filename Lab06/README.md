# Product Management with DynamoDB Local

Ung dung CRUD san pham su dung:

- Express + EJS
- Upload anh local vao thu muc images
- DynamoDB local (khong dung S3)

## Cai dat

1. Cai dependencies

```bash
npm install
```

2. Chay DynamoDB local bang Docker

```bash
docker compose up -d
```

3. Tao bien moi truong trong file .env (neu chua co)

```env
PORT=3000
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
DYNAMODB_ENDPOINT=http://localhost:8000
```

4. Chay app

```bash
npm run dev
```

Mo: http://localhost:3000

## Ghi chu

- Anh duoc luu local tai thu muc images va phuc vu qua route /images.
- Khi update anh moi, anh cu se duoc xoa.
- Khi xoa product, file anh cung duoc xoa.
- Project da bo hoan toan phan S3 upload.
