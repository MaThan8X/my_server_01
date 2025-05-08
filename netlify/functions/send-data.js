// 1. Import hàm createClient từ thư viện supabase-js
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi tạo client Supabase với hai biến môi trường
const supabase = createClient(
  process.env.SUPABASE_URL,     // URL của project Supabase
  process.env.SUPABASE_ANON_KEY  // Khóa public anon key
)

// 3. Export hàm handler để Netlify gọi khi endpoint được truy cập
exports.handler = async function(event) {
  // 4. Lấy toàn bộ chuỗi query sau dấu ? dưới key 'id'
  //    (vì chúng ta dùng ; để phân tách, Netlify gom hết vào id)
  const raw = event.queryStringParameters.id || ''

  // 5. Tách chuỗi raw thành mảng từng cặp 'key=value'
  const parts = raw.split(';')
  const params = {}  // Object để lưu giá trị sau khi tách

  parts.forEach(pair => {
    const [key, ...rest] = pair.split('=')
    if (key) {
      // 6. Gán params[key] = phần còn lại nối lại (trường hợp value có dấu '=')
      params[key] = rest.join('=')
    }
  })

  // 7. Lấy từng giá trị cụ thể từ object params
  const { id, date, time, mucnuoc, vol, cbe1x4x } = params

  try {
    // 8. Thực hiện insert một bản ghi vào bảng 'sensor_data'
    const { data, error } = await supabase
      .from('sensor_data')
      .insert([{
        id,
        date,
        time,
        mucnuoc: parseInt(mucnuoc,  10), // chuyển string sang int
        vol:    parseInt(vol,       10),
        cbe1x4x                         // giữ nguyên chuỗi
      }])

    // 9. Nếu có lỗi từ Supabase, trả về status 500 cùng thông báo
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 10. Thành công, trả về status 200 và JSON xác nhận
    return {
      statusCode: 200,
      body: JSON.stringify({
        status:   'received',
        id,
        date,
        time,
        mucnuoc: Number(mucnuoc),
        vol:      Number(vol),
        cbe1x4x
      })
    }
  } catch (err) {
    // 11. Bắt bất kỳ ngoại lệ nào và trả về lỗi 500
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
