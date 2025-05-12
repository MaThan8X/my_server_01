// public/app.js
let selectedId = '';
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput = document.getElementById('fromInput');
  const toInput   = document.getElementById('toInput');
  const viewBtn   = document.getElementById('viewBtn');
  const stationTbody = document.getElementById('stations');
  const chartArea = document.getElementById('chart-area');

  // Load sidebar IDs
  async function loadStations() {
    const res = await fetch('/.netlify/functions/get-ids');
    const ids = await res.json();

    // Build rows
    let html = '<tr data-id=""><td>Tất cả</td></tr>' +
      ids.map(id => `<tr data-id="${id}"><td>${id}</td></tr>`).join('');
    stationTbody.innerHTML = html;

    // Attach click events
    stationTbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => {
        stationTbody.querySelectorAll('tr').forEach(r => r.classList.remove('active'));
        tr.classList.add('active');
        selectedId = tr.dataset.id;
        fetchData();
      });
    });

    // Default active 'Tất cả'
    stationTbody.querySelector('tr[data-id=""]').classList.add('active');
  }

  // Fetch data and toggle charts
  async function fetchData() {
    if (selectedId) chartArea.classList.add('active-charts');
    else chartArea.classList.remove('active-charts');

    const params = [];
    if (fromInput.value) params.push(`from=${encodeURIComponent(fromInput.value)}`);
    if (toInput.value)   params.push(`to=${encodeURIComponent(toInput.value)}`);
    if (selectedId)      params.push(`id=${encodeURIComponent(selectedId)}`);

    let url = '/.netlify/functions/get-data';
    if (params.length) url += '?' + params.join('&');

    const res  = await fetch(url);
    const data = await res.json();

    renderTable(data);
    if (selectedId) renderCharts(data);
  }

  // Render table
  function renderTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const limit = selectedId ? 10 : 30;

    data.slice(0, limit).forEach(r => {
      const tr = document.createElement('tr');
      // ID
      const tdId = document.createElement('td'); tdId.textContent = r.id; tr.appendChild(tdId);
      // Other cols
      ['date','time','mucnuoc','vol','cbe1x4x'].forEach(key => {
        const td = document.createElement('td'); td.textContent = r[key]; tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // Render charts
  function renderCharts(data) {
    const labels    = data.map(r => `${r.date} ${r.time}`);
    const waterData = data.map(r => Number(r.mucnuoc));
    const voltData  = data.map(r => Number(r.vol));

    if (!waterChart) {
      waterChart = new Chart(
        document.getElementById('waterChart').getContext('2d'),
        { type:'line', data:{labels, datasets:[{label:'Mực nước (cm)', data:waterData, fill:false, borderWidth:2}]}, options:{responsive:true} }
      );
    } else {
      waterChart.data.labels = labels;
      waterChart.data.datasets[0].data = waterData;
      waterChart.update();
    }

    if (!voltChart) {
      voltChart = new Chart(
        document.getElementById('voltChart').getContext('2d'),
        { type:'line', data:{labels, datasets:[{label:'Điện áp (VoL)', data:voltData, fill:false, borderWidth:2}]}, options:{responsive:true} }
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