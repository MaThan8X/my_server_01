// public/app.js

let selectedId = '';    // ID đang chọn ('' = tất cả)
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput = document.getElementById('fromInput');
  const toInput   = document.getElementById('toInput');
  const viewBtn   = document.getElementById('viewBtn');

  // 1. Load danh sách Mã Trạm
  async function loadStations() {
    const res = await fetch('/.netlify/functions/get-ids');
    const ids = await res.json();
    const ul  = document.getElementById('stations');
    ul.innerHTML = '<li data-id="">Tất cả</li>' +
      ids.map(id => `<li data-id="${id}">${id}</li>`).join('');
    ul.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        ul.querySelectorAll('li').forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        selectedId = li.dataset.id;
        fetchData();
      });
    });
  }

  // 2. Fetch dữ liệu (có lọc id)
  async function fetchData() {
    const from = encodeURIComponent(fromInput.value);
    const to   = encodeURIComponent(toInput.value);
    let url = `/.netlify/functions/get-data?from=${from}&to=${to}`;
    if (selectedId) url += `&id=${selectedId}`;
    const res  = await fetch(url);
    const data = await res.json();
    renderTable(data);
    renderCharts(data);
  }

  // 3. Vẽ bảng dữ liệu
  function renderTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const limit = selectedId ? 10 : 30;
    data.slice(0, limit).forEach(r => {
      const tr = document.createElement('tr');
      ['ID','Ngày','Giờ','Mục nước','Vol','CBE1X4X'].forEach(col => {
        const td = document.createElement('td');
        td.textContent = r[col];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // 4. Vẽ/ cập nhật biểu đồ
  function renderCharts(data) {
    const labels    = data.map(r => `${r['Ngày']} ${r['Giờ']}`);
    const waterData = data.map(r => Number(r['Mục nước']));
    const voltData  = data.map(r => Number(r['Vol']));

    // Chart mực nước
    if (!waterChart) {
      waterChart = new Chart(
        document.getElementById('myChart').getContext('2d'),
        {
          type: 'line',
          data: { labels, datasets: [{ label:'Mực nước (cm)', data:waterData, fill:false, borderWidth:2 }] },
          options: { responsive:true, scales:{ x:{display:true}, y:{display:true, beginAtZero:true} } }
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
          data: { labels, datasets: [{ label:'Điện áp (VoL)', data:voltData, fill:false, borderWidth:2 }] },
          options: { responsive:true, scales:{ x:{display:true}, y:{display:true, beginAtZero:true} } }
        }
      );
    } else {
      voltChart.data.labels = labels;
      voltChart.data.datasets[0].data = voltData;
      voltChart.update();
    }
  }

  // 5. Events
  viewBtn.addEventListener('click', fetchData);
  loadStations();
  fetchData();
});
