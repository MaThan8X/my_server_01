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
      if (!res.ok) throw new Error('get-ids status ' + res.status);
      const ids = await res.json();
      // Tạo li list
      const frag = document.createDocumentFragment();
      // 'Tất cả'
      const liAll = document.createElement('li');
      liAll.textContent = 'Tất cả';
      liAll.dataset.id = '';
      frag.appendChild(liAll);
      // Các ID
      ids.forEach(id => {
        const li = document.createElement('li');
        li.textContent = id;
        li.dataset.id = id;
        frag.appendChild(li);
      });
      stationList.innerHTML = '';
      stationList.appendChild(frag);
      // Event
      stationList.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
          stationList.querySelectorAll('li').forEach(x => x.classList.remove('active'));
          li.classList.add('active');
          selectedId = li.dataset.id;
          fetchData();
        });
      });
      // Active mặc định
      stationList.querySelector('li[data-id=""]').classList.add('active');
    } catch (err) {
      console.error('Error loading stations:', err);
    }
  }

  // 2️⃣ Fetch data & toggle charts
  async function fetchData() {
    chartArea.classList.toggle('active-charts', !!selectedId);
    const params = [];
    if (fromInput.value) params.push(`from=${encodeURIComponent(fromInput.value)}`);
    if (toInput.value)   params.push(`to=${encodeURIComponent(toInput.value)}`);
    if (selectedId)      params.push(`id=${encodeURIComponent(selectedId)}`);
    const url = '/.netlify/functions/get-data' + (params.length ? '?' + params.join('&') : '');
    try {
      const res = await fetch(url);
      const data = await res.json();
      renderTable(data);
      if (selectedId) renderCharts(data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  // 3️⃣ Render table
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

  // 4️⃣ Render charts
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
      waterChart.data.labels = labels; waterChart.data.datasets[0].data = waterData; waterChart.update();
    }
    if (!voltChart) {
      voltChart = new Chart(
        document.getElementById('voltChart').getContext('2d'),
        { type:'line', data:{labels,datasets:[{label:'Điện áp (VoL)',data:voltData,fill:false,borderWidth:2}]}, options:{responsive:true} }
      );
    } else {
      voltChart.data.labels = labels; voltChart.data.datasets[0].data = voltData; voltChart.update();
    }
  }

  // Initialize
  viewBtn.addEventListener('click', fetchData);
  loadStations();
  fetchData();
});