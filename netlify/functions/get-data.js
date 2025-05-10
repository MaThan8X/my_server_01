const path = require('path');
const xlsx = require('xlsx');

exports.handler = async (event) => {
  const { from, to, id } = event.queryStringParameters || {};
  const p = path.resolve(__dirname, '../../data/sensor_data.xlsx');
  const wb = xlsx.readFile(p);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  let rows = xlsx.utils.sheet_to_json(sheet);

  // Lọc ngày
  rows = rows.filter(r => {
    const d = new Date(r['Ngày']);
    if (from && d < new Date(from)) return false;
    if (to   && d > new Date(to))   return false;
    return true;
  });

  // Lọc ID
  if (id) rows = rows.filter(r => r.ID === id);

  // Sort giảm dần
  rows.sort((a, b) => new Date(`${b['Ngày']}T${b['Giờ']}`) - new Date(`${a['Ngày']}T${a['Giờ']}`));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows)
  };
};
