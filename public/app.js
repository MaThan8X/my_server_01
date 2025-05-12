// public/app.js
let selectedId = '';
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput   = document.getElementById('fromInput');
  const toInput     = document.getElementById('toInput');
  const viewBtn     = document.getElementById('viewBtn');
  const stationList = document.getElementById('stations');
  const chartArea   = document.getElementById('chart-area');

  // 1️⃣ Load sidebar IDs, dùng get-ids, fallback get-data
  async function loadStations() {
    let ids = [];
    try {
      const res = await fetch('/.netlify/functions/get-ids');
      if (res.ok) ids = await res.json();
    } catch (e) {
      console.warn('get-ids failed, will fallback:', e);
    }
    if (!ids.length) {
      try {
        const res2 = await fetch('/.netlify/functions/get-data');
        const all = await res2.json();
        ids = Array.from(new Set(all.map(r => r.id))).sort().reverse();
      } catch (e) {
        console.error('fallback get-data failed:', e);
      }
    }
    // Build list
    stationList.innerHTML = '';
    const liAll = document.createElement('li');
    liAll.textContent = 'Tất cả';
    liAll.dataset.id = '';
    stationList.appendChild(liAll);
    ids.forEach(id => {
      const li = document.createElement('li');
      li.textContent = id;
      li.dataset.id = id;
      stationList.appendChild(li);
    });
    // Event
    stationList.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        stationList.querySelectorAll('li').forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        selectedId = li.dataset.id;
        fetchData();
      });
    });
    // Default
    stationList.querySelector('li[data-id=""]').classList.add('active');
  }

  // 2️⃣ Fetch data & toggle charts
  async function fetchData() {
    chartArea.classList.toggle('active-charts', !!selectedId);
    let url = '/.netlify/functions/get-data';
    const qs = [];
    if (fromInput.value) qs.push(`from=${encodeURIComponent(fromInput.value)}`);
    if (toInput.value)   qs.push(`to=${encodeURIComponent(toInput.value)}`);
    if (selectedId)      qs.push(`id=${encodeURIComponent(selectedId)}`);
    if (qs.length) url += '?' + qs.join('&');
    try {
      const res = await fetch(url);
      const data = await res.json();
      renderTable(data);
      if (selectedId) renderCharts(data);
    } catch (e) {
      console.error('fetchData error:', e);
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

  // Init
  viewBtn.addEventListener('click', fetchData);
  loadStations();
  fetchData();
});