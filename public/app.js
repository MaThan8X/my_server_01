// public/app.js
let selectedId = '';
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput = document.getElementById('fromInput');
  const toInput   = document.getElementById('toInput');
  const viewBtn   = document.getElementById('viewBtn');
  const stationList = document.getElementById('stations');
  const chartArea  = document.getElementById('chart-area');

  // 1️⃣ Load sidebar IDs
  async function loadStations() {
    try {
      const res = await fetch('/.netlify/functions/get-ids');
      const ids = await res.json();
      // Build simple list
      stationList.innerHTML = '<li data-id="">Tất cả</li>' +
        ids.map(id => `<li data-id="${id}">${id}</li>`).join('');
      // Attach click events
      stationList.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
          stationList.querySelectorAll('li').forEach(x => x.classList.remove('active'));
          li.classList.add('active');
          selectedId = li.dataset.id;
          fetchData();
        });
      });
      // Default active
      stationList.querySelector('li[data-id=""]').classList.add('active');
    } catch (err) {
      console.error('Error loading stations:', err);
    }
  }

  // 2️⃣ Fetch data & toggle charts
  async function fetchData() {
    chartArea.classList.toggle('active-charts', !!selectedId);
    let url = '/.netlify/functions/get-data';
    if (selectedId) url += `?id=${selectedId}`;
    const res = await fetch(url);
    const data = await res.json();
    renderTable(data);
    if (selectedId) renderCharts(data);
  }

  // 3️⃣ Render table data
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

    if (!waterChart) {
      waterChart = new Chart(
        document.getElementById('waterChart').getContext('2d'),
        { type:'line', data:{labels,datasets:[{label:'Mực nước (cm)',data:waterData,fill:false,borderWidth:2}]}, options:{responsive:true} }
      );
    } else {
      waterChart.data.labels = labels;
      waterChart.data.datasets[0].data = waterData;
      waterChart.update();
    }

    if (!voltChart) {
      voltChart = new Chart(
        document.getElementById('voltChart').getContext('2d'),
        { type:'line', data:{labels,datasets:[{label:'Điện áp (VoL)',data:voltData,fill:false,borderWidth:2}]}, options:{responsive:true} }
      );
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