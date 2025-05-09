// 1. Import createClient từ supabase-js để kết nối Supabase
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi tạo Supabase client với URL và ANON key từ ENV
const supabase = createClient(
  process.env.SUPABASE_URL,     // biến SUPABASE_URL đã set trên Netlify
  process.env.SUPABASE_ANON_KEY  // biến SUPABASE_ANON_KEY đã set trên Netlify
)

// 3. Export handler (bắt buộc) để Netlify Functions gọi vào
exports.handler = async function(event) {
  // 4. Lấy phần value sau “?id=” do Netlify gom hết vào key "id"
  //    Ví dụ event.queryStringParameters.id = "F01774;date=...;time=...;"
  const rawValue = event.queryStringParameters.id || ''

  // 5. Prepend “id=” để khi split ta có “id=F01774” thay vì “F01774”
  const rawString = `id=${rawValue}`

  // 6. Tách chuỗi theo dấu ';', lọc bỏ empty elements
  const parts = rawString
    .split(';')       // ["id=F01774", "date=07/05/2025", ... , ""]
    .filter(p => p)   // loại bỏ phần cuối rỗng

  // 7. Parse từng cặp "key=value" vào object params
  const params = {}
  parts.forEach(pair => {
    const idx = pair.indexOf('=')      // tìm vị trí dấu '=' đầu tiên
    if (idx > 0) {
      const key   = pair.substring(0, idx)      // trước '=' là key
      const value = pair.substring(idx + 1)     // sau '=' là value
      params[key] = value                       // gán vào object
    }
  })

  // 8. Lấy từng giá trị cần thiết
  const { id, date, time, mucnuoc, vol, cbe1x4x } = params

  try {
    // 9. Thực hiện insert vào bảng sensor_data
    const { data, error } = await supabase
      .from('sensor_data')
      .insert([{
        id,                                      // TEXT
        date,                                    // TEXT
        time,                                    // TEXT
        mucnuoc: parseInt(mucnuoc, 10),          // INT
        vol:    parseInt(vol,    10),            // INT
        cbe1x4x                                  // TEXT
      }])

    // 10. Nếu insert lỗi, trả về 500 kèm message
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 11. Thành công, trả về JSON xác nhận cùng dữ liệu đã parse
    return {
      statusCode: 200,
      body: JSON.stringify({
        status:   'received',
        id, date, time,
        mucnuoc: Number(mucnuoc),
        vol:      Number(vol),
        cbe1x4x
      })
    }

  } catch (err) {
    // 12. Bắt mọi exception khác, trả về 500
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
