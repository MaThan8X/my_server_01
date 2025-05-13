// netlify/functions/get-ids.js

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
