// netlify/functions/send-data.js

// 1. Import builder của Supabase
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi Supabase client với ENV vars (đã cấu hình trên Netlify)
const supabase = createClient(
  process.env.SUPABASE_URL,     // URL project Supabase, ví dụ https://xyz.supabase.co
  process.env.SUPABASE_ANON_KEY  // Public anon key (cấp quyền insert/query công khai)
)

// 3. Export handler để Netlify chạy như Lambda
exports.handler = async function(event) {
  // 4. Lấy rawQueryString (phần sau dấu “?” trong URL GET)
  //    ví dụ "id=F01774;date=07/05/2025;time=14:30;..."
  const rawQS = event.rawQueryString || ''

  // 5. Tạo một URL tạm với dummy origin, gắn rawQS vào
  //    URLSearchParams sau đó sẽ tự split cả ";" và "&"
  const tmpUrl = new URL('http://dummy/?' + rawQS)

  // 6. Dễ dàng truy xuất param qua tmpUrl.searchParams
  const params = tmpUrl.searchParams

  // 7. Lấy từng tham số; nếu không có sẽ trả về null
  const id      = params.get('id')
  const date    = params.get('date')
  const time    = params.get('time')
  const mucnuoc = params.get('mucnuoc')
  const vol     = params.get('vol')
  const cbe1x4x = params.get('cbe1x4x')

  // 8. Kiểm tra bắt buộc đủ 6 tham số
  if (!id || !date || !time || !mucnuoc || !vol || !cbe1x4x) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Thiếu tham số: id, date, time, mucnuoc, vol hoặc cbe1x4x'
      })
    }
  }

  try {
    // 9. Chuyển kiểu int cho mucnuoc và vol
    const mu = parseInt(mucnuoc, 10)
    const vo = parseInt(vol,     10)

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

    // 11. Nếu Supabase có lỗi, trả về 500 kèm message
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 12. Thành công → phản hồi JSON echo lại
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
    // 13. Bắt mọi exception khác
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
