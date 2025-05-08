// 1. Import hàm createClient từ supabase-js
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi tạo Supabase client giống trên
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 3. Export handler cho Netlify Functions
exports.handler = async function() {
  try {
    // 4. Query bảng sensor_data
    //    - Lấy tối đa 20 bản ghi mới nhất (entry_id giảm dần)
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('entry_id', { ascending: false })
      .limit(20)

    // 5. Nếu có lỗi, trả về status 500
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 6. Trả về dữ liệu dưới dạng mảng JSON
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (err) {
    // 7. Bắt lỗi và trả về status 500
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
