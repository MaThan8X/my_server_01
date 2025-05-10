const path = require('path');
const xlsx = require('xlsx');

exports.handler = async () => {
  const p = path.resolve(__dirname, '../../data/sensor_data.xlsx');
  const wb = xlsx.readFile(p);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const ids = Array.from(new Set(rows.map(r => r.ID)))
                   .sort((a, b) => b.localeCompare(a));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids)
  };
};
