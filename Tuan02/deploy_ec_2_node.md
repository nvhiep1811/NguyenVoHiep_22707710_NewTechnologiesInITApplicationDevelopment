# HƯỚNG DẪN DEPLOY ỨNG DỤNG NODE.JS LÊN AWS EC2

---

## 1. Thông tin chung

- **Môn học**: New Technologies in IT Application Development
- **Nội dung**: Triển khai (deploy) ứng dụng Node.js lên Amazon EC2
- **Nền tảng chính**: Ubuntu Server 22.04 LTS
- **Công nghệ sử dụng**: Node.js, PM2, Nginx, HTTPS (Let’s Encrypt – nip.io)

---

## 2. Mục tiêu

- Triển khai thành công ứng dụng Node.js lên môi trường cloud (AWS EC2)
- Ứng dụng chạy ổn định ở chế độ production
- Truy cập được qua Internet bằng HTTPS
- Hiểu quy trình kết nối SSH và quản lý SSH key

---

## 3. Chuẩn bị môi trường

### 3.1. Tạo EC2 Instance

- AMI: **Ubuntu Server 22.04 LTS** (khuyến nghị)
- Instance type: `t3.micro` (Free Tier)
- Key pair: tạo mới và tải về file `.pem`
- Security Group (Inbound Rules):
  - SSH (22): My IP
  - HTTP (80): `0.0.0.0/0`
  - HTTPS (443): `0.0.0.0/0`

---

## 4. Quản lý SSH Key và kết nối EC2

### 4.1. Lưu SSH key trên máy local

Trên máy local (Linux / WSL / macOS):

```bash
mkdir -p ~/.ssh
mv my_key.pem ~/.ssh/
chmod 400 ~/.ssh/my_key.pem
```

> ⚠️ File `.pem` **không được upload lên GitHub** và phải bảo mật.

---

### 4.2. Kết nối SSH vào EC2 (Ubuntu)

```bash
ssh -i ~/.ssh/my_key.pem ubuntu@EC2_PUBLIC_IP
```

> 📌 **Lưu ý**: Với Ubuntu AMI, user mặc định là `ubuntu`.

---

## 5. Cài đặt môi trường trên EC2 (Ubuntu)

### 5.1. Cập nhật hệ thống và cài Node.js

```bash
sudo apt update
sudo apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs
```

Kiểm tra:

```bash
node -v
npm -v
```

---

### 5.2. Cài PM2

```bash
sudo npm install -g pm2
```

---

## 6. Triển khai mã nguồn

### 6.1. Clone project

```bash
mkdir -p ~/apps
cd ~/apps
git clone <REPO_URL>
cd <PROJECT_FOLDER>
npm install
```

---

### 6.2. Tạo file `.env`

File `.env` dùng để cấu hình biến môi trường và **không được commit lên GitHub**.

```bash
nano .env
```

Ví dụ:

```env
PORT=3000
NODE_ENV=production
```

---

## 7. Chạy ứng dụng bằng PM2

```bash
pm2 start app.js --name myapp
pm2 status
```

Thiết lập PM2 tự chạy khi reboot:

```bash
pm2 startup
pm2 save
```

---

## 8. Cấu hình Nginx (Reverse Proxy)

### 8.1. Tạo file cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/myapp
```

Nội dung:

```nginx
server {
  listen 80 default_server;
  listen [::]:80 default_server;

  server_name _;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable site:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. Cấu hình HTTPS miễn phí (nip.io)

### 9.1. Xác định domain

```bash
EC2_IP=$(curl -s ifconfig.me)
DOMAIN="app.${EC2_IP}.nip.io"
```

### 9.2. Cập nhật `server_name`

```bash
sudo sed -i "s/server_name _;/server_name ${DOMAIN} ${EC2_IP}.nip.io;/" \
/etc/nginx/sites-available/myapp

sudo nginx -t
sudo systemctl reload nginx
```

---

### 9.3. Cài Certbot và xin SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d "$DOMAIN"
```

Chọn **Redirect HTTP → HTTPS** khi được hỏi.

---

## 10. Kết quả triển khai

- Ứng dụng Node.js chạy ổn định với PM2
- Nginx reverse proxy
- Truy cập qua HTTPS

```text
https://app.<EC2_PUBLIC_IP>.nip.io
```

---

## 11. Quy trình cập nhật mã nguồn

```bash
cd ~/apps/<PROJECT_FOLDER>
git pull
npm install
pm2 restart myapp
sudo systemctl reload nginx
```

---

## 12. Debug và kiểm tra nhanh

```bash
pm2 status
pm2 logs myapp
sudo nginx -t
sudo ss -lntp | egrep ':80|:443|:3000'
```

---

## 13. Phụ lục – Ghi chú cho nền tảng khác

### 13.1. Amazon Linux

- SSH user: `ec2-user`
- Package manager: `yum` / `dnf`

```bash
ssh -i key.pem ec2-user@EC2_PUBLIC_IP
```

### 13.2. Windows Server

- Không khuyến nghị cho Node.js
- Kết nối bằng Remote Desktop (RDP)
- Cấu hình phức tạp và tốn tài nguyên

---

## 14. Kết luận

Quy trình deploy sử dụng **EC2 Ubuntu + Node.js + PM2 + Nginx + HTTPS miễn phí** phù hợp cho:

- Bài tập học phần
- Project cá nhân
- Demo / Proof of Concept

Quy trình đảm bảo ứng dụng chạy ổn định, bảo mật và có khả năng mở rộng.
