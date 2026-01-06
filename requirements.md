# 1. Phân hệ người dùng nặc danh (Guest)

## 1.1 Hệ thống Menu
- Hiển thị danh sách danh mục (category)
- Có 2 cấp danh mục, ví dụ:
  - Điện tử ➠ Điện thoại di động  
  - Điện tử ➠ Máy tính xách tay  
  - Thời trang ➠ Giày  
  - Thời trang ➠ Đồng hồ  
  - …

## 1.2 Trang chủ
- Top 5 sản phẩm gần kết thúc
- Top 5 sản phẩm có nhiều lượt ra giá nhất
- Top 5 sản phẩm có giá cao nhất

## 1.3 Xem danh sách sản phẩm
- Theo danh mục (category)
- Có phân trang

## 1.4 Tìm kiếm sản phẩm
- Sử dụng kỹ thuật **Full-text search**
- Tìm theo:
  - Tên sản phẩm
  - Và/hoặc danh mục
- Phân trang kết quả
- Sắp xếp theo:
  - Thời gian kết thúc giảm dần
  - Giá tăng dần
- Những sản phẩm mới đăng (trong vòng **N phút**) sẽ được hiển thị nổi bật hơn

### 1.4.1 Thông tin hiển thị trên trang danh sách
- Ảnh đại diện sản phẩm
- Tên sản phẩm
- Giá hiện tại
- Thông tin bidder đang đặt giá cao nhất
- Giá mua ngay (nếu có)
- Ngày đăng sản phẩm
- Thời gian còn lại
- Số lượt ra giá hiện tại
- Click vào category để chuyển nhanh sang màn hình **Xem danh sách sản phẩm**

## 1.5 Xem chi tiết sản phẩm
- Nội dung đầy đủ của sản phẩm
- Ảnh đại diện (size lớn)
- Các ảnh phụ (ít nhất 3 ảnh)
- Tên sản phẩm
- Giá hiện tại
- Giá mua ngay (nếu có)
- Thông tin người bán & điểm đánh giá
- Thông tin người đặt giá cao nhất hiện tại & điểm đánh giá
- Thời điểm đăng
- Thời điểm kết thúc  
  - Nếu còn < 3 ngày → hiển thị **relative time** (3 ngày nữa, 10 phút nữa, …)
- Mô tả chi tiết sản phẩm
- Lịch sử câu hỏi & trả lời giữa bidder và người bán
- 5 sản phẩm khác cùng chuyên mục

## 1.6 Đăng ký
- Bắt buộc đăng ký để có thể đặt giá (bid)
- reCaptcha
- Mật khẩu mã hoá bằng **bcrypt** hoặc **scrypt**
- Thông tin:
  - Họ tên
  - Địa chỉ
  - Email (không trùng)
- Xác nhận OTP qua email

---

# 2. Phân hệ người mua (Bidder)

## 2.1 Watch List
- Lưu sản phẩm yêu thích tại:
  - View danh sách sản phẩm
  - View chi tiết sản phẩm

## 2.2 Ra giá
- Thực hiện tại view **Chi tiết sản phẩm**
- Điều kiện:
  - Điểm đánh giá > 80% mới được phép ra giá
  - Ví dụ: 8/10 đánh giá tích cực → 80% → hợp lệ
  - Bidder chưa có đánh giá → chỉ được ra giá nếu người bán cho phép
- Hệ thống:
  - Đề nghị giá hợp lệ (giá hiện tại + bước giá)
  - Yêu cầu xác nhận trước khi đặt giá

## 2.3 Xem lịch sử đấu giá
- Thông tin bidder được che (mask) một phần

| Thời điểm            | Người mua | Giá       |
|---------------------|-----------|-----------|
| 27/10/2025 10:43    | ****Khoa  | 6,000,000 |
| 27/10/2025 09:43    | ****Kha   | 5,900,000 |
| 27/10/2025 08:43    | ****Tuấn  | 5,800,000 |
| 27/10/2025 07:43    | ****Khánh | 5,700,000 |

## 2.4 Hỏi người bán
- Thực hiện tại view **Chi tiết sản phẩm**
- Người bán nhận email thông báo
- Email chứa link mở nhanh chi tiết sản phẩm để trả lời

## 2.5 Quản lý hồ sơ cá nhân
- Đổi email, họ tên, mật khẩu (yêu cầu mật khẩu cũ)
- Xem điểm đánh giá & lịch sử nhận xét
- Xem:
  - Watch list
  - Sản phẩm đang tham gia đấu giá
  - Sản phẩm đã thắng
- Đánh giá người bán:
  - +1 hoặc -1
  - Kèm nhận xét

## 2.6 Xin được bán trong vòng 7 ngày
- Bidder gửi yêu cầu nâng cấp thành **seller**
- Ban quản trị xét duyệt

---

# 3. Người bán (Seller)

## 3.1 Đăng sản phẩm đấu giá
- Thông tin bắt buộc:
  - Tên sản phẩm
  - Tối thiểu 3 ảnh
  - Giá khởi điểm
  - Bước giá
  - Giá mua ngay (nếu có)
  - Mô tả sản phẩm
- Hỗ trợ WYSIWYG:
  - QuillJS
  - TinyMCE
- Gia hạn tự động:
  - Có lượt đấu giá mới trong 5 phút cuối → gia hạn thêm 10 phút
  - Tham số cấu hình bởi quản trị viên

## 3.2 Bổ sung mô tả sản phẩm
- Chỉ được **append** vào mô tả cũ
- Không được thay thế nội dung cũ

### Ví dụ cập nhật mô tả
✏️ **31/10/2025**
- が大きくなる事がありますがご了承下さい。

✏️ **05/11/2025**
- 不得意ジャンルの買い取り品の為細かい確認出来る知識がありません、ご了承ください。

## 3.3 Từ chối lượt ra giá
- Thực hiện tại view **Chi tiết sản phẩm**
- Người mua bị từ chối không được đấu giá tiếp
- Nếu đang giữ giá cao nhất → chuyển cho người giá cao thứ nhì

## 3.4 Trả lời câu hỏi
- Thực hiện tại view **Chi tiết sản phẩm**

## 3.5 Quản lý hồ sơ cá nhân (Seller)
- Xem:
  - Sản phẩm đang đăng & còn hạn
  - Sản phẩm đã kết thúc đấu giá
- Đánh giá người thắng:
  - +1 hoặc -1
- Hủy giao dịch:
  - Tự động đánh giá -1
  - Nhận xét: *Người thắng không thanh toán*

---

# 4. Phân hệ quản trị viên (Administrator)

- Các chức năng:
  - Xem danh sách
  - Xem chi tiết
  - Thêm / Xoá / Cập nhật
  - Các thao tác chuyên biệt

## 4.1 Quản lý danh mục
- CRUD cơ bản
- Không được xoá danh mục đã có sản phẩm

## 4.2 Quản lý sản phẩm
- Gỡ bỏ sản phẩm vi phạm

## 4.3 Quản lý người dùng
- CRUD cơ bản
- Duyệt yêu cầu nâng cấp **bidder ➠ seller**

---

# 5. Tính năng chung

## 5.1 Đăng nhập
- Tự cài đặt hoặc dùng **PassportJS**
- Khuyến khích:
  - Google
  - Facebook
  - Twitter
  - GitHub

## 5.2 Cập nhật thông tin cá nhân
- Họ tên
- Email
- Ngày sinh

## 5.3 Đổi mật khẩu
- Mã hoá bằng **bcrypt** hoặc **scrypt**

## 5.4 Quên mật khẩu
- Xác nhận OTP qua email

---

# 6. Hệ thống

## 6.1 Mailing System
- Gửi email cho các sự kiện quan trọng:
  - Ra giá thành công
  - Người mua bị từ chối
  - Đấu giá kết thúc (có / không có người thắng)
  - Hỏi & trả lời sản phẩm

## 6.2 Đấu giá tự động
- Người mua nhập **giá tối đa**
- Hệ thống tự động tăng giá vừa đủ để thắng đối thủ
- Nếu cùng giá → người ra trước thắng

### Ví dụ
**Sản phẩm:** iPhone 11  
- Giá khởi điểm: 10,000,000  
- Bước giá: 100,000  

#### Đấu giá thông thường
Bidder phải thao tác liên tục

#### Đấu giá tự động
Giá vào sản phẩm luôn là **giá vừa đủ thắng**

> Hệ thống chỉ hỗ trợ **1 trong 2**: đấu giá thường **hoặc** đấu giá tự động

---

# 7. Quy trình thanh toán sau đấu giá

- Người bán & người thắng được dẫn tới view **Hoàn tất đơn hàng**
- Quy trình 4 bước:
  1. Người mua cung cấp hoá đơn & địa chỉ giao hàng
  2. Người bán xác nhận nhận tiền & gửi thông tin vận chuyển
  3. Người mua xác nhận đã nhận hàng
  4. Hai bên đánh giá giao dịch (+/- kèm nhận xét)
- Có giao diện chat giữa người bán & người mua
- Người bán có thể huỷ giao dịch và đánh giá -1 nếu người mua không thanh toán
- Hai bên có thể thay đổi đánh giá sau này

---

# 8. Các yêu cầu khác

## 8.1 Yêu cầu kỹ thuật
- Web App:
  - SSR (MVC) hoặc
  - CSR (ReactJS) hoặc
  - Kết hợp
- SSR stack:
  - ExpressJS
  - Handlebars / EJS
  - MySQL / PostgreSQL / MongoDB
- CSR stack:
  - Backend: RESTful API
  - Frontend: ReactJS SPA
- Chỉ thực hiện **đúng chức năng yêu cầu**
- **Không yêu cầu realtime**

## 8.2 Yêu cầu dữ liệu
- Tối thiểu:
  - 20 sản phẩm
  - 4–5 danh mục
- Mỗi sản phẩm:
  - Mô tả & hình ảnh đầy đủ
  - Ít nhất 5 lượt ra giá
