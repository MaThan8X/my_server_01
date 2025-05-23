// public/app.js

let selectedId = '';    
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput    = document.getElementById('fromInput');
  const toInput      = document.getElementById('toInput');
  const viewBtn      = document.getElementById('viewBtn');
  const stationList  = document.getElementById('stations');
  const chartArea    = document.getElementById('chart-area');
  const tableWrapper = document.querySelector('.table-wrapper');

  // 1️⃣ Load sidebar IDs, fallback nếu get-ids lỗi
  async function loadStations() {
    let ids = [];
    try {
      const res = await fetch('/.netlify/functions/get-ids');
      if (!res.ok) throw new Error('get-ids failed');
      ids = await res.json();
    } catch (err) {
      console.warn('get-ids errored, falling back to get-data:', err);
      const res2 = await fetch('/.netlify/functions/get-data');
      const all   = await res2.json();
      ids = Array.from(new Set(all.map(r => r.id))).sort().reverse();
    }
    stationList.innerHTML = '<li data-id="">Tất cả</li>' +
      ids.map(id => `<li data-id="${id}">${id}</li>`).join('');
    stationList.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        stationList.querySelectorAll('li').forEach(x=>x.classList.remove('active'));
        li.classList.add('active');
        selectedId = li.dataset.id;
        fetchData();
      });
    });
    stationList.querySelector('li[data-id=""]').classList.add('active');
  }

  // 2️⃣ Fetch data & render
  async function fetchData() {
    // Show/hide charts area
    chartArea.classList.toggle('active-charts', !!selectedId);
    // Table scrolling mode
    tableWrapper.classList.toggle('main-mode', selectedId === '');
    tableWrapper.classList.toggle('single-mode', selectedId !== '');

    // Build URL
    let url = '/.netlify/functions/get-data';
    const params = [];
    if (fromInput.value) params.push(`from=${fromInput.value}`);
    if (toInput.value)   params.push(`to=${toInput.value}`);
    if (selectedId)      params.push(`id=${selectedId}`);
    if (params.length) url += '?' + params.join('&');

    // Fetch & render
    const res  = await fetch(url);
    const data = await res.json();
    renderTable(data);
    if (selectedId) renderCharts(data);
  }

  // 3️⃣ Render table (30 rows for all, 10 for single)
  function renderTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const limit = selectedId ? 10 : 30;
    data.slice(0, limit).forEach(r => {
      const tr = document.createElement('tr');
      ['id','date','time','mucnuoc','vol','cbe1x4x'].forEach(k => {
        const td = document.createElement('td');
        td.textContent = r[k];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // 4️⃣ Render/Update charts with aspectRatio=2
  function renderCharts(data) {
    const labels    = data.map(r => `${r.date} ${r.time}`);
    const waterData = data.map(r => Number(r.mucnuoc));
    const voltData  = data.map(r => Number(r.vol));

    // Volt chart
    if (!voltChart) {
      voltChart = new Chart(
        document.getElementById('voltChart').getContext('2d'),
        {
          type: 'line',
          data: { labels, datasets:[{
            label: 'Điện áp (VoL)',
            data: voltData, fill: false, borderWidth: 2
          }]},
          options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
              y: { ticks: { maxTicksLimit: 5 } },
              x: { ticks: { maxTicksLimit: 8, maxRotation: 45 } }
            }
          }
        }
      );
    } else {
      voltChart.data.labels = labels;
      voltChart.data.datasets[0].data = voltData;
      voltChart.update();
    }

    // Water chart
    if (!waterChart) {
      waterChart = new Chart(
        document.getElementById('waterChart').getContext('2d'),
        {
          type: 'line',
          data: { labels, datasets:[{
            label: 'Mực nước (cm)',
            data: waterData, fill: false, borderWidth: 2
          }]},
          options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
              y: { ticks: { maxTicksLimit: 5 } },
              x: { ticks: { maxTicksLimit: 8, maxRotation: 45 } }
            }
          }
        }
      );
    } else {
      waterChart.data.labels = labels;
      waterChart.data.datasets[0].data = waterData;
      waterChart.update();
    }
  }

  // 5️⃣ Events
  viewBtn.addEventListener('click', fetchData);

  // Initialize
  loadStations();
  fetchData();
});
