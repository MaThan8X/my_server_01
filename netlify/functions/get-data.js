// netlify/functions/get-data.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Khởi Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  const { from, to, id } = event.queryStringParameters || {};
  try {
    // Xây dựng query
    let query = supabase.from('sensor_data').select('*');
    if (id)   query = query.eq('id', id);
    if (from) query = query.gte('date', from);
    if (to)   query = query.lte('date', to);
    // Sắp xếp giảm dần theo date rồi time
    query = query
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    // Thực thi
    const { data, error } = await query;
    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('get-data error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
