// models/SensorData.js

// 1. Import DataTypes từ Sequelize để định nghĩa kiểu dữ liệu cho các trường
const { DataTypes } = require('sequelize')

// 2. Import instance sequelize đã khởi tạo trong config/db.js
const { sequelize } = require('../config/db')

// 3. Định nghĩa model SensorData tương ứng bảng sensor_data
const SensorData = sequelize.define(
  'SensorData',       // Tên model (mang tính tham chiếu)
  {
    // Định nghĩa các cột của bảng
    id: {
      type: DataTypes.INTEGER,    // Số nguyên
      autoIncrement: true,        // Tự động tăng giá trị
      primaryKey: true            // Khóa chính
    },
    device: {
      type: DataTypes.STRING,     // Chuỗi ký tự (ví dụ "A7672S")
      allowNull: false            // Không cho phép rỗng
    },
    value: {
      type: DataTypes.FLOAT,      // Số thực (ví dụ 123.45)
      allowNull: false
    },
    ts: {
      type: DataTypes.BIGINT,     // Số nguyên lớn, lưu timestamp UNIX
      allowNull: false
    }
  },
  {
    tableName: 'sensor_data',     // Tên bảng trong MySQL
    timestamps: false             // Không tự thêm cột createdAt/updatedAt
  }
)

// 4. Xuất model để có thể import ở các file khác
module.exports = SensorData
