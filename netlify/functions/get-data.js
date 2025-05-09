// 1. Import Supabase client
const { createClient } = require('@supabase/supabase-js')

// 2. Khởi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 3. Export handler
exports.handler = async function(event) {
  try {
    // 4. Lấy query params (nếu có): from, to (định dạng dd/MM/yyyy)
    const url = new URL(event.rawUrl, 'http://dummy')
    const from = url.searchParams.get('from')
    const to   = url.searchParams.get('to')

    // 5. Build query Supabase
    let query = supabase
      .from('sensor_data')
      .select('id, date, time, mucnuoc, vol, cbe1x4x, created_at')
      .order('created_at', { ascending: false })

    // 6. Nếu có giới hạn thời gian, apply filter
    if (from) query = query.gte('date', from)
    if (to)   query = query.lte('date', to)

    // 7. Thực thi và lấy data
    const { data, error } = await query

    if (error) {
      console.error('Supabase get-data error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      }
    }

    // 8. Trả về JSON mảng bản ghi
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.error('Exception in get-data:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
