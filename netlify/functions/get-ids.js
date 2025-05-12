// netlify/functions/get-ids.js

// 1. Load biến môi trường
require('dotenv').config();

// 2. Khởi Sequelize (như trên)
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host:     process.env.DB_HOST,
    dialect:  process.env.DB_DIALECT,
    logging:  false
  }
);

// 3. Định nghĩa model nếu chưa có
const SensorData = sequelize.define('SensorData', {
  id:       { type: DataTypes.STRING,  primaryKey: true },
  date:     { type: DataTypes.DATEONLY },
  time:     { type: DataTypes.TIME },
  mucnuoc:  { type: DataTypes.INTEGER },
  vol:      { type: DataTypes.INTEGER },
  cbe1x4x:  { type: DataTypes.STRING }
}, {
  tableName: 'sensor_data',
  timestamps: false
});

// 4. Handler chỉ lấy danh sách ID duy nhất
exports.handler = async () => {
  try {
    // 5. DISTINCT id, sắp xếp DESC
    const results = await SensorData.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('id')), 'id']
      ],
      order: [['id', 'DESC']]
    });

    const ids = results.map(r => r.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids)
    };
  } catch (error) {
    console.error('get-ids error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
