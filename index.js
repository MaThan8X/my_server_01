// index.js

// 1. Load và cấu hình biến môi trường
require('dotenv').config()  
// ‣ Đọc file `.env` và gán biến vào process.env (DB_*, PORT,…)

// 2. Import các thư viện & module cần thiết
const express             = require('express')              // Web framework
const cors                = require('cors')                 // Middleware cho CORS
const { testConnection, sequelize } = require('./config/db')// testConnection và instance Sequelize
const SensorData          = require('./models/SensorData')   // Model cho bảng sensor_data
const apiRouter           = require('./routes/api')         // Router chứa /api/ping, /api/data

// 3. Khởi tạo ứng dụng Express
const app = express()  
// ‣ Tạo một instance Express để thiết lập HTTP server

// 4. Phục vụ file tĩnh trong thư mục public
app.use(express.static('public'))
// ‣ Tất cả file trong public/ (index.html, app.js, styles.css) sẽ được serve

// 5. Cấu hình middleware toàn cục
app.use(cors())             // Cho phép front-end ở domain bất kỳ gọi API
app.use(express.json())     // Parse JSON body của POST request

// 6. Gắn router cho các endpoint bắt đầu bằng /api
app.use('/api', apiRouter)  
// ‣ Ví dụ: GET /api/ping, GET /api/data, POST /api/data

// 7. Kết nối và đồng bộ cơ sở dữ liệu
testConnection()            // In “Kết nối MySQL thành công!” hoặc lỗi
sequelize
  .sync()                   // Tạo bảng sensor_data nếu chưa có
  .then(() => console.log('🔄 Bảng sensor_data đã được đồng bộ!'))
  .catch(err => console.error('❌ Lỗi sync model:', err))

// 8. Khởi động HTTP server
const PORT = process.env.PORT || 3000  
// ‣ Lấy PORT từ ENV hoặc mặc định 3000
app.listen(PORT, () => {
  // Khi server start thành công, in địa chỉ
  console.log(`Server đang chạy ở http://localhost:${PORT}`)
})
