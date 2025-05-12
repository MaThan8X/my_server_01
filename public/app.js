// public/app.js
let selectedId = '';
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput = document.getElementById('fromInput');
  const toInput   = document.getElementById('toInput');
  const viewBtn   = document.getElementById('viewBtn');
  const stationTbody = document.getElementById('stations');
  const chartArea = document.getElementById('chart-area');

  // 1️⃣ Load sidebar IDs, thử get-ids trước, fallback dùng get-data
  async function loadStations() {
    let ids = [];
    try {
      const res = await fetch('/.netlify/functions/get-ids');
      if (res.ok) ids = await res.json();
    } catch (err) {
      console.error('get-ids failed:', err);
    }
    // Nếu không có gì, fallback lấy từ get-data
    if (!ids.length) {
      try {
        const res2 = await fetch('/.netlify/functions/get-data');
        const all = await res2.json();
        ids = Array.from(new Set(all.map(r => r.id))).sort().reverse();
      } catch (err) {
        console.error('fallback get-data IDs failed:', err);
      }
    }

    // Tạo rows: 'Tất cả' + các ID
    const rows = ['<tr data-id=""><td>Tất cả</td></tr>']
      .concat(ids.map(id => `<tr data-id="${id}"><td>${id}</td></tr>`));
    stationTbody.innerHTML = rows.join('');

    // Đính sự kiện click
    stationTbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => {
        stationTbody.querySelectorAll('tr').forEach(r => r.classList.remove('active'));
        tr.classList.add('active');
        selectedId = tr.dataset.id;
        fetchData();
      });
    });
    // Active mặc định 'Tất cả'
    const first = stationTbody.querySelector('tr[data-id=""]');
    if (first) first.classList.add('active');
  }

  // 2️⃣ Fetch và render dữ liệu
  async function fetchData() {
    // Show/hide chart area
    if (selectedId) chartArea.classList.add('active-charts');
    else chartArea.classList.remove('active-charts');

    const params = [];
    if (fromInput.value) params.push(`from=${encodeURIComponent(fromInput.value)}`);
    if (toInput.value)   params.push(`to=${encodeURIComponent(toInput.value)}`);
    if (selectedId)      params.push(`id=${encodeURIComponent(selectedId)}`);

    let url = '/.netlify/functions/get-data';
    if (params.length) url += '?' + params.join('&');
    try {
      const res  = await fetch(url);
      const data = await res.json();
      renderTable(data);
      if (selectedId) renderCharts(data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  // 3️⃣ Render bảng dữ liệu, luôn có cột ID
  function renderTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const limit = selectedId ? 10 : 30;
    data.slice(0, limit).forEach(r => {
      const tr = document.createElement('tr');
      // Cột ID
      const tdId = document.createElement('td');
      tdId.textContent = r.id;
      tr.appendChild(tdId);
      // Các cột tiếp theo
      ['date','time','mucnuoc','vol','cbe1x4x'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = r[key];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // 4️⃣ Render / cập nhật Chart.js
  function renderCharts(data) {
    const labels    = data.map(r => `${r.date} ${r.time}`);
    const waterData = data.map(r => Number(r.mucnuoc));
    const voltData  = data.map(r => Number(r.vol));

    // Chart mực nước
    if (!waterChart) {
      waterChart = new Chart(
        document.getElementById('waterChart').getContext('2d'),
        {
          type: 'line',
          data: { labels, datasets: [{ label: 'Mực nước (cm)', data: waterData, fill: false, borderWidth: 2 }] },
          options: { responsive: true }
        }
      );
    } else {
      waterChart.data.labels = labels;
      waterChart.data.datasets[0].data = waterData;
      waterChart.update();
    }

    // Chart điện áp
    if (!voltChart) {
      voltChart = new Chart(
        document.getElementById('voltChart').getContext('2d'),
        {
          type: 'line',
          data: { labels, datasets: [{ label: 'Điện áp (VoL)', data: voltData, fill: false, borderWidth: 2 }] },
          options: { responsive: true }
        }
      );
    } else {
      voltChart.data.labels = labels;
      voltChart.data.datasets[0].data = voltData;
      voltChart.update();
    }
  }

  // Khởi tạo
  viewBtn.addEventListener('click', fetchData);
  loadStations();
  fetchData();
});