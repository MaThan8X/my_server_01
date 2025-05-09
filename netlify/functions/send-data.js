// 1. Import supabase client builder
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi tạo Supabase với URL và anon key từ ENV
const supabase = createClient(
  process.env.SUPABASE_URL,     // Ví dụ https://xyz.supabase.co
  process.env.SUPABASE_ANON_KEY  // Public anon key
)

// 3. Export handler để Netlify gọi
exports.handler = async function(event) {
  // 4. Lấy raw query string (phần sau dấu '?'), ví dụ:
  //    "id=F01774;date=07/05/2025;time=14:30;..."
  const rawQS = event.rawQueryString || ''

  // 5. Split thành các cặp key=value, tách qua ';' hoặc '&'
  //    .filter(Boolean) để loại bỏ chuỗi rỗng
  const pairs = rawQS
    .split(/[&;]/)    // tách qua dấu & hoặc ;
    .filter(Boolean)  // bỏ những entry rỗng

  // 6. Parse từng "key=value" vào object params
  const params = {}
  for (let pair of pairs) {
    const idx = pair.indexOf('=')
    if (idx > 0) {
      const key   = pair.substring(0, idx)      // trước dấu '='
      const value = pair.substring(idx + 1)     // sau dấu '='
      params[key] = value                       // gán vào params
    }
  }

  // 7. Lấy 6 tham số cần thiết—hoặc null nếu không có
  const id      = params.id      || null
  const date    = params.date    || null
  const time    = params.time    || null
  const mucnuoc = params.mucnuoc || null
  const vol     = params.vol     || null
  const cbe1x4x = params.cbe1x4x || null

  // 8. Validate: nếu thiếu tham số nào, trả về 400 Bad Request
  if (!id || !date || !time || !mucnuoc || !vol || !cbe1x4x) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Thiếu tham số: id, date, time, mucnuoc, vol hoặc cbe1x4x'
      })
    }
  }

  try {
    // 9. Chuyển kiểu số cho mucnuoc và vol
    const mu   = parseInt(mucnuoc, 10)
    const vo   = parseInt(vol,     10)

    // 10. Ghi dữ liệu vào bảng sensor_data
    const { error } = await supabase
      .from('sensor_data')
      .insert([{
        id,           // text
        date,         // text
        time,         // text
        mucnuoc: mu,  // int
        vol:      vo, // int
        cbe1x4x      // text
      }])

    // 11. Nếu Supabase trả về lỗi, phản hồi lại 500
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 12. Thành công, trả về JSON xác nhận và echo lại dữ liệu
    return {
      statusCode: 200,
      body: JSON.stringify({
        status:   'received',
        id, date, time,
        mucnuoc: mu,
        vol:      vo,
        cbe1x4x
      })
    }
  } catch (err) {
    // 13. Bắt mọi exception khác, trả về 500
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
