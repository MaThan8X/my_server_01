// netlify/functions/send-data.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Khởi Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // Phân tích chuỗi rawQueryString
  const params = event.rawQueryString
    .split(';')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});

  try {
    // Chèn dữ liệu vào bảng sensor_data
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
