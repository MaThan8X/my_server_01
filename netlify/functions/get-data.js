// netlify/functions/get-data.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function(event) {
  try {
    const url   = new URL(event.rawUrl, 'http://dummy');
    const from  = url.searchParams.get('from');
    const to    = url.searchParams.get('to');
    const id    = url.searchParams.get('id');

    let query = supabase
      .from('sensor_data')
      .select('id, date, time, mucnuoc, vol, cbe1x4x, created_at')
      .order('created_at', { ascending: false });

    if (from) query = query.gte('date', from);
    if (to)   query = query.lte('date', to);
    if (id)   query = query.eq('id', id);

    const { data, error } = await query;
    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('Supabase get-data error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}