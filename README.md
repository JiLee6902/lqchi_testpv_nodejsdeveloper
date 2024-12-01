
# Dự Án Quản Lý Người Dùng

## Cấu Trúc Mã Nguồn

Dự án này bao gồm các dịch vụ và mô-đun xử lý các tác vụ liên quan đến người dùng như đăng ký, đăng nhập, cập nhật thông tin, thay đổi mật khẩu và quản lý trạng thái người dùng. Cấu trúc mã nguồn bao gồm các file chính như sau:

- `access.service.ts`: Dịch vụ xử lý các yêu cầu đăng ký, đăng nhập, đăng xuất, và làm mới token.
- `user.service.ts`: Dịch vụ quản lý thông tin người dùng, bao gồm tìm kiếm, cập nhật, xóa và thay đổi trạng thái người dùng.
- `dockerfile.dev`: File cấu hình Docker cho môi trường development.
- `dockerfile.prod`: File cấu hình Docker cho môi trường phát triển.
- `dockercompose.yml`: Cấu hình Docker Compose để thiết lập môi trường container cho ứng dụng.

## Thông Tin Môi Trường Phát Triển
Để phát triển ứng dụng, bạn cần các công cụ sau:

- Node.js (phiên bản 20 trở lên)
- Docker và Docker Compose

## Hướng Dẫn Build và Deploy

### 1. Cài Đặt Môi Trường

Trước tiên, bạn cần cài đặt các phụ thuộc của dự án:

```bash
npm install
```

### 2. Build Docker Image & Chạy dự án

Để xây dựng Docker image cho môi trường phát triển, chạy lệnh sau:

```bash
docker-compose -f docker-compose.yml build
```

### 3. Chạy Dự Án

Sau khi build thành công, bạn có thể chạy dự án trong môi trường container bằng lệnh:

```bash
docker-compose -f docker-compose.yml up
```

Ứng dụng sẽ được chạy trên cổng `3000`.

## Hoặc có thể chạy lệnh để vừa build vừa chạy dự án trong môi trường container:
```bash
docker-compose up --build
```

## Các Tính Năng Đã Làm

- **Đăng ký người dùng**: Cho phép người dùng đăng ký tài khoản mới. Kiểm tra nếu tài khoản đã tồn tại và tạo user mới trong cơ sở dữ liệu MongoDB.
- **Đăng nhập**: Xác thực người dùng qua tên người dùng và mật khẩu. Nếu hợp lệ, hệ thống tạo token mới và lưu vào cơ sở dữ liệu.
- **Đăng xuất**: Cập nhật trạng thái của token trong cơ sở dữ liệu, đánh dấu token không hợp lệ.
- **Làm mới token**: Cung cấp chức năng làm mới token nếu token cũ còn hiệu lực.
- **Cập nhật thông tin người dùng**: Cho phép cập nhật các thông tin của người dùng, ngoại trừ mật khẩu.
- **Xóa người dùng**: Xóa người dùng khỏi cơ sở dữ liệu và hủy token liên quan.
- **Quản lý trạng thái người dùng**: Cập nhật trạng thái người dùng là "active" hoặc "deactive".
- **Thay đổi mật khẩu**: Cho phép người dùng thay đổi mật khẩu, yêu cầu xác thực mật khẩu cũ và token xác nhận qua email.
- **Dùng redis để xem thông tin người dùng nhanh hơn**: Xem thông tin người dùng nhanh hơn.
- **Dùng elasticsearch để ghi log**: Dùng elasticsearch để ghi log




## Cấu Trúc Dự Án

- **/**: có sử dung singleton design pattern
- **/models**: Chứa các mô hình dữ liệu (user, key token).
- **/repo**: Chứa các dịch vụ xử lý nghiệp vụ thường xuyên.
- **/services**: Chứa các dịch vụ xử lý nghiệp vụ (AccessService, UserService).
- **/utils**: Các công cụ trợ giúp như chuyển đổi dữ liệu, tạo token.
- **/core**: Chứa các lỗi tùy chỉnh như BadRequestError, AuthFailureError.
- **/dbs**: Cấu hình kết nối cơ sở dữ liệu MongoDB và Redis.
- **/router**: Chứa các router 
- **/controller**: Chứa các controller 
- **/config**: Để config các dịch vụ như redis, mongo, elasticsearch  



## Các Lệnh Docker

- `docker-compose up`: Khởi động tất cả các dịch vụ.
- `docker-compose down`: Dừng và xóa tất cả các container.
- `docker-compose logs`: Xem log của các container đang chạy.

---

