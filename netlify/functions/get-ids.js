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
  cbe1x4x:  { type: DataTypes.STRING }// netlify/functions/get-ids.js

// 1️⃣ Nạp biến môi trường (cho netlify dev local)
require('dotenv').config()

// 2️⃣ Import Supabase client
const { createClient } = require('@supabase/supabase-js')

// 3️⃣ Khởi Supabase với ENV vars
const supabase = createClient(
  process.env.SUPABASE_URL,       // PHẢI có trên Netlify
  process.env.SUPABASE_ANON_KEY    // PHẢI có trên Netlify
)

// 4️⃣ Export handler
exports.handler = async function(event) {
  try {
    // 5️⃣ Lấy tối đa 1000 bản ghi, chọn trường id, sắp giảm dần
    const { data, error } = await supabase
      .from('sensor_data')
      .select('id')
      .order('id', { ascending: false })
      .limit(1000)

    if (error) throw error

    // 6️⃣ Lọc duy nhất
    const uniqueIds = Array.from(new Set(data.map(item => item.id)))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uniqueIds)
    }
  } catch (err) {
    console.error('get-ids error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}

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
