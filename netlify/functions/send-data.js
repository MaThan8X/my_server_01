// 1. Import createClient từ supabase-js để kết nối Supabase
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi tạo Supabase client với URL và Anon Key từ ENV
const supabase = createClient(
  process.env.SUPABASE_URL,     // SUPABASE_URL đã set trên Netlify
  process.env.SUPABASE_ANON_KEY  // SUPABASE_ANON_KEY đã set trên Netlify
)

// 3. Export handler để Netlify gọi khi có HTTP request
exports.handler = async function(event) {
  // 4. Lấy object queryStringParameters 
  //    Netlify tự parse cả dấu ';' và '&'
  const q = event.queryStringParameters || {}

  // 5. Lấy trực tiếp từng giá trị (hoặc undefined nếu không có)
  const id      = q.id       || null
  const date    = q.date     || null
  const time    = q.time     || null
  const mucnuoc = q.mucnuoc  || null
  const vol     = q.vol      || null
  const cbe1x4x = q.cbe1x4x  || null

  // 6. Kiểm tra bắt buộc: nếu thiếu bất kỳ đâu, trả về 400
  if (!id || !date || !time || !mucnuoc || !vol || !cbe1x4x) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Thiếu tham số: id, date, time, mucnuoc, vol hoặc cbe1x4x'
      })
    }
  }

  try {
    // 7. Ghi vào bảng sensor_data
    const { error } = await supabase
      .from('sensor_data')
      .insert([{
        id,                             // TEXT
        date,                           // TEXT
        time,                           // TEXT
        mucnuoc: parseInt(mucnuoc, 10), // INT
        vol:    parseInt(vol,    10),   // INT
        cbe1x4x                         // TEXT
      }])

    // 8. Nếu Supabase trả về lỗi, chuyển tiếp 500
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 9. Thành công, phản hồi 200 với JSON xác nhận
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'received',
        id, date, time,
        mucnuoc: Number(mucnuoc),
        vol:      Number(vol),
        cbe1x4x
      })
    }
  } catch (err) {
    // 10. Bắt ngoại lệ bất kỳ, trả về 500
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
