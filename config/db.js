// config/db.js

// 1. Load và cấu hình biến môi trường
require('dotenv').config()  
// ‣ Đọc file `.env` nằm ở gốc project và gán mọi biến có định dạng KEY=VALUE vào process.env
// ‣ Ví dụ: process.env.DB_NAME, process.env.DB_USER, v.v.

// 2. Import lớp Sequelize từ package sequelize
const { Sequelize } = require('sequelize')  
// ‣ Sequelize là ORM giúp Node.js tương tác với các cơ sở dữ liệu quan hệ
// ‣ Chúng ta sẽ sử dụng lớp này để khởi tạo kết nối và định nghĩa model

// 3. Tạo một instance của Sequelize để thiết lập kết nối với MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Tên cơ sở dữ liệu, ví dụ "iot_db"
  process.env.DB_USER,      // Tên user kết nối, ví dụ "T2T_Thanh86"
  process.env.DB_PASS,      // Mật khẩu user đã thiết lập trong phpMyAdmin
  {
    host: process.env.DB_HOST,       // Địa chỉ máy chủ DB, thường là "localhost"
    dialect: process.env.DB_DIALECT, // Loại cơ sở dữ liệu, ở đây là "mysql"
    logging: false                   // Tắt log SQL; nếu muốn debug, đặt thành console.log
  }
)
// ‣ Kết quả: một đối tượng `sequelize` lưu giữ cấu hình kết nối, sẵn sàng dùng để sync/model/query

// 4. Định nghĩa hàm kiểm tra kết nối đến database
async function testConnection() {
  try {
    // 4.1. Thử authenticate (xác thực) với DB
    await sequelize.authenticate()
    // 4.2. Nếu không có lỗi, in thông báo thành công
    console.log('✅ Kết nối MySQL thành công!')
  } catch (error) {
    // 4.3. Nếu lỗi xảy ra (user/host sai, DB không tồn tại, v.v.), in chi tiết lỗi
    console.error('❌ Kết nối MySQL thất bại:', error)
  }
}

// 5. Xuất đối tượng sequelize và hàm testConnection để sử dụng ở các file khác
module.exports = {
  sequelize,        // Instance kết nối DB, dùng để sync model và thực hiện truy vấn
  testConnection    // Hàm tiện ích để kiểm tra kết nối ngay khi server khởi động
}
