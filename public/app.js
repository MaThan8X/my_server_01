// public/app.js
let selectedId = '';
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput = document.getElementById('fromInput');
  const toInput   = document.getElementById('toInput');
  const viewBtn   = document.getElementById('viewBtn');
  const stationTbody = document.getElementById('stations');
  const chartArea = document.getElementById('chart-area');

  // 1️⃣ Load sidebar IDs
  async function loadStations() {
    try {
      const res = await fetch('/.netlify/functions/get-ids');
      const ids = await res.json();
      const rows = ['<tr data-id=""><td>Tất cả</td></tr>']
        .concat(ids.map(id => `<tr data-id="${id}"><td>${id}</td></tr>`));
      stationTbody.innerHTML = rows.join('');
      stationTbody.querySelectorAll('tr').forEach(tr => {
        tr.addEventListener('click', () => {
          stationTbody.querySelectorAll('tr').forEach(r => r.classList.remove('active'));
          tr.classList.add('active');
          selectedId = tr.dataset.id;
          fetchData();
        });
      });
      stationTbody.querySelector('tr[data-id=""]').classList.add('active');
    } catch (err) {
      console.error('Error loading stations:', err);
    }
  }

  // 2️⃣ Fetch data & toggle chart visibility
  async function fetchData() {
    // Show chart only for specific ID
    chartArea.classList.toggle('active-charts', !!selectedId);

    const params = [];
    if (fromInput.value) params.push(`from=${encodeURIComponent(fromInput.value)}`);
    if (toInput.value)   params.push(`to=${encodeURIComponent(toInput.value)}`);
    if (selectedId)      params.push(`id=${encodeURIComponent(selectedId)}`);

    const url = '/.netlify/functions/get-data' + (params.length ? '?' + params.join('&') : '');
    try {
      const res  = await fetch(url);
      const data = await res.json();
      renderTable(data);
      if (selectedId) renderCharts(data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  // 3️⃣ Render table with ID always visible
  function renderTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const limit = selectedId ? 10 : 30;
    data.slice(0, limit).forEach(r => {
      const tr = document.createElement('tr');
      ['id','date','time','mucnuoc','vol','cbe1x4x'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = r[key];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // 4️⃣ Render or update charts
  function renderCharts(data) {
    const labels    = data.map(r => `${r.date} ${r.time}`);
    const waterData = data.map(r => Number(r.mucnuoc));
    const voltData  = data.map(r => Number(r.vol));

    const waterCtx = document.getElementById('waterChart').getContext('2d');
    const voltCtx  = document.getElementById('voltChart').getContext('2d');

    if (!waterChart) {
      waterChart = new Chart(waterCtx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Mực nước (cm)', data: waterData, fill: false, borderWidth: 2 }] },
        options: { responsive: true }
      });
    } else {
      waterChart.data.labels = labels;
      waterChart.data.datasets[0].data = waterData;
      waterChart.update();
    }

    if (!voltChart) {
      voltChart = new Chart(voltCtx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Điện áp (VoL)', data: voltData, fill: false, borderWidth: 2 }] },
        options: { responsive: true }
      });
    } else {
      voltChart.data.labels = labels;
      voltChart.data.datasets[0].data = voltData;
      voltChart.update();
    }
  }

  // Initialize
  viewBtn.addEventListener('click', fetchData);
  loadStations();
  fetchData();
});