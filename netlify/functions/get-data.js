// netlify/functions/get-data.js

// 1. Import supabase client từ thư viện supabase-js
import { createClient } from '@supabase/supabase-js'

// 2. Khởi supabase client với biến môi trường do Netlify cung cấp
//    - SUPABASE_URL: URL project Supabase (ví dụ https://xyl9h2a5.supabase.co)
//    - SUPABASE_ANON_KEY: public anon key để truy cập bảng
const supabase = createClient(
  process.env.SUPABASE_URL,    // Lấy từ Netlify ENV
  process.env.SUPABASE_ANON_KEY // Lấy từ Netlify ENV
)

/**
 * 3. Handler sẽ được Netlify gọi khi client fetch '/.netlify/functions/get-data'
 * @param {object} event   Thông tin request (phương thức, headers, v.v.)
 * @returns {object}       Đáp trả HTTP với statusCode và body JSON
 */
export async function handler(event) {
  try {
    // 4. Query toàn bộ bản ghi từ bảng 'sensor_data', sắp xếp theo created_at tăng dần
    const { data, error } = await supabase
      .from('sensor_data')               // Tên bảng
      .select('*')                       // Chọn tất cả cột
      .order('created_at', { ascending: true }) // Sắp xếp theo cột created_at

    // 5. Nếu có lỗi từ Supabase, ném ra để catch phía dưới
    if (error) throw error

    // 6. Trả về JSON chứa mảng record cho front-end
    return {
      statusCode: 200,                   // HTTP 200 OK
      body: JSON.stringify(data)         // Chuyển mảng sang chuỗi JSON
    }
  } catch (err) {
    // 7. Nếu có lỗi nào khác, log ra console Netlify và trả 500
    console.error('❌ get-data error:', err)
    return {
      statusCode: 500,                   // HTTP 500 Internal Server Error
      body: JSON.stringify({ error: err.message })
    }
  }
}
