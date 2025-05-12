// netlify/functions/send-data.js

// 1️⃣ Import Supabase
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 2️⃣ Export handler
exports.handler = async function(event, context) {
  // —————— Debug logging ——————
  console.log('🏷️ event.rawQueryString =', event.rawQueryString)
  console.log('🏷️ event.rawUrl         =', event.rawUrl)

  // 3️⃣ Lấy queryString, ưu tiên rawQueryString, fallback rawUrl
  let rawQS = event.rawQueryString
  if (!rawQS || rawQS === '') {
    // event.rawUrl = "/.netlify/functions/send-data?id=...;date=...;"
    const parts = (event.rawUrl || '').split('?')
    rawQS = parts[1] || ''
  }

  // 4️⃣ Thay ';' thành '&' để URLSearchParams nhận
  rawQS = rawQS.replace(/;/g, '&')

  // 5️⃣ Tạo URL dummy và parse params
  const tmp    = new URL('http://dummy/?' + rawQS)
  const params = tmp.searchParams

  // 6️⃣ Lấy các tham số
  const id      = params.get('id')
  const date    = params.get('date')
  const time    = params.get('time')
  const mucnuoc = params.get('mucnuoc')
  const vol     = params.get('vol')
  const cbe1x4x = params.get('cbe1x4x')

  console.log('🎯 Parsed params:', { id, date, time, mucnuoc, vol, cbe1x4x })

  // 7️⃣ Validate
  if (!id || !date || !time || !mucnuoc || !vol || !cbe1x4x) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Thiếu tham số: id, date, time, mucnuoc, vol hoặc cbe1x4x'
      })
    }
  }

  try {
    // 8️⃣ Chuyển kiểu số
    const mu = parseInt(mucnuoc, 10)
    const vo = parseInt(vol,     10)

    // 9️⃣ Insert vào Supabase
    const { error } = await supabase
      .from('sensor_data')
      .insert([{
        id,
        date,
        time,
        mucnuoc: mu,
        vol:      vo,
        cbe1x4x
      }])

    if (error) {
      console.error('❌ Supabase error:', error)
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message })
      }
    }

    // 🔟 Thành công
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status:   'received',
        id, date, time,
        mucnuoc: mu,
        vol:      vo,
        cbe1x4x
      })
    }
  } catch (err) {
    console.error('⚠️ Exception:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    }
  }
}
