// public/app.js

let selectedId = '';
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput   = document.getElementById('fromInput');
  const toInput     = document.getElementById('toInput');
  const viewBtn     = document.getElementById('viewBtn');
  const stationList = document.getElementById('stations');
  const chartArea   = document.getElementById('chart-area');
  const tableWrapper= document.querySelector('.table-wrapper');

  // 1️⃣ Load sidebar IDs
  async function loadStations() {
    let ids = [];
    try {
      const res = await fetch('/.netlify/functions/get-ids');
      if (res.ok) ids = await res.json();
    } catch (e) {
      console.warn('get-ids failed:', e);
    }
    if (!ids.length) {
      try {
        const res2 = await fetch('/.netlify/functions/get-data');
        const all  = await res2.json();
        ids = Array.from(new Set(all.map(r => r.id))).sort().reverse();
      } catch (e) {
        console.error('fallback get-data failed:', e);
      }
    }
    // Build list
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
  }

  // 2️⃣ Fetch data & toggle modes
  async function fetchData() {
    // show/hide charts
    chartArea.classList.toggle('active-charts', !!selectedId);

    // set table mode class
    if (selectedId === '') {
      tableWrapper.classList.add('main-mode');
      tableWrapper.classList.remove('single-mode');
    } else {
      tableWrapper.classList.add('single-mode');
      tableWrapper.classList.remove('main-mode');
    }

    // build URL
    let url = '/.netlify/functions/get-data';
    const params = [];
    if (fromInput.value) params.push(`from=${encodeURIComponent(fromInput.value)}`);
    if (toInput.value)   params.push(`to=${encodeURIComponent(toInput.value)}`);
    if (selectedId)      params.push(`id=${encodeURIComponent(selectedId)}`);
    if (params.length) url += '?' + params.join('&');

    try {
      const res  = await fetch(url);
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
    // we slice in JS but CSS .table-wrapper.main-mode will scroll only if >30 rows
    const rows = data.map(r => {
      const tr = document.createElement('tr');
      ['id','date','time','mucnuoc','vol','cbe1x4x'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = r[key];
        tr.appendChild(td);
      });
      return tr;
    });
    // main view: show up to 30 in DOM to optimize; single view: show up to 10
    const limit = selectedId ? 10 : 30;
    rows.slice(0, limit).forEach(tr => tbody.appendChild(tr));
  }

  // 4️⃣ Render/update charts
  function renderCharts(data) {
    const labels    = data.map(r => `${r.date} ${r.time}`);
    const waterData = data.map(r => Number(r.mucnuoc));
    const voltData  = data.map(r => Number(r.vol));

    // volt chart (top)
    if (!voltChart) {
      voltChart = new Chart(
        document.getElementById('voltChart').getContext('2d'),
        { type:'line',
          data:{labels, datasets:[{label:'Điện áp (VoL)',data:voltData,fill:false,borderWidth:2}]},
          options:{responsive:true}
        }
      );
    } else {
      voltChart.data.labels = labels;
      voltChart.data.datasets[0].data = voltData;
      voltChart.update();
    }

    // water chart (below)
    if (!waterChart) {
      waterChart = new Chart(
        document.getElementById('waterChart').getContext('2d'),
        { type:'line',
          data:{labels, datasets:[{label:'Mực nước (cm)',data:waterData,fill:false,borderWidth:2}]},
          options:{responsive:true}
        }
      );
    } else {
      waterChart.data.labels = labels;
      waterChart.data.datasets[0].data = waterData;
      waterChart.update();
    }
  }

  // Initialize
  viewBtn.addEventListener('click', fetchData);
  loadStations();
  fetchData();
});
