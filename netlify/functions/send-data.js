// netlify/functions/send-data.js

// 1️⃣ Import Supabase client builder
const { createClient } = require('@supabase/supabase-js')

// 2️⃣ Khởi Supabase với ENV vars từ Netlify
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 3️⃣ Export handler cho Netlify Functions
exports.handler = async function(event) {
  // 4️⃣ Lấy nguyên raw query string (ví dụ "id=F01774;date=...")
  let rawQS = event.rawQueryString || ''

  // 5️⃣ Thay toàn bộ ';' thành '&' để parser hiểu đúng
  //    "id=F01774;date=07/05/2025" → "id=F01774&date=07/05/2025"
  rawQS = rawQS.replace(/;/g, '&')

  // 6️⃣ Tạo URL dummy gắn rawQS, rồi dùng URLSearchParams
  const tmp = new URL('http://dummy/?' + rawQS)
  const params = tmp.searchParams

  // 7️⃣ Lấy từng tham số (null nếu không có)
  const id      = params.get('id')
  const date    = params.get('date')
  const time    = params.get('time')
  const mucnuoc = params.get('mucnuoc')
  const vol     = params.get('vol')
  const cbe1x4x = params.get('cbe1x4x')

  // 8️⃣ Validate bắt buộc đủ 6 trường
  if (!id || !date || !time || !mucnuoc || !vol || !cbe1x4x) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Thiếu tham số: id, date, time, mucnuoc, vol hoặc cbe1x4x'
      })
    }
  }

  try {
    // 9️⃣ Chuyển mucnuoc/vol thành số
    const mu = parseInt(mucnuoc, 10)
    const vo = parseInt(vol,     10)

    // 🔟 Insert vào Supabase
    const { error } = await supabase
      .from('sensor_data')
      .insert([{
        id, date, time,
        mucnuoc: mu,
        vol:      vo,
        cbe1x4x
      }])

    // 1️⃣1️⃣ Nếu lỗi DB, trả 500 kèm message
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 1️⃣2️⃣ Thành công → trả về xác nhận và echo lại dữ liệu
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
    // 1️⃣3️⃣ Bắt mọi exception khác
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
