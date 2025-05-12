// netlify/functions/send-data.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Khởi Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  // 1. Lấy raw query string; nếu undefined thì fallback
  let raw = event.rawQueryString;
  if (!raw) {
    // Khi semicolons, event.queryStringParameters.id chứa toàn bộ chuỗi
    const paramsObj = event.queryStringParameters || {};
    // Nếu chỉ có 1 key (id) bao gồm cả chuỗi phân tách, raw = that value
    if (Object.keys(paramsObj).length === 1 && paramsObj.id) {
      raw = paramsObj.id;
    } else {
      // Hoặc ghép lại từ tất cả keys (nếu dùng & bình thường)
      raw = Object.entries(paramsObj)
        .map(([k, v]) => `${k}=${v}`)
        .join(';');
    }
  }

  // 2. Parse các cặp key=value phân tách bằng ;
  const params = raw
    .split(';')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});

  try {
    // 3. Chèn bản ghi vào Supabase
    const { data, error } = await supabase
      .from('sensor_data')
      .insert([{
        id:      params.id,
        date:    params.date,
        time:    params.time,
        mucnuoc: Number(params.mucnuoc),
        vol:     Number(params.vol),
        cbe1x4x: params.cbe1x4x
      }]);

    if (error) throw error;

    // 4. Trả về kết quả
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'received', ...params })
    };
  } catch (error) {
    console.error('send-data error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', message: error.message })
    };
  }
};
