// 1. Import createClient để kết nối Supabase
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi tạo Supabase client với các biến ENV
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 3. Export handler để Netlify Functions gọi
exports.handler = async function() {
  try {
    // 4. Lấy tối đa 20 bản ghi mới nhất, sắp xếp theo entry_id giảm dần
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('entry_id', { ascending: false })
      .limit(20)

    // 5. Nếu có lỗi từ Supabase, trả về 500 và message
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 6. Trả về mảng JSON dữ liệu
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }

  } catch (err) {
    // 7. Bắt exception và trả về 500
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
