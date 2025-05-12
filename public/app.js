// public/app.js

let selectedId = '';    // '' = Tất cả
let waterChart = null, voltChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const fromInput = document.getElementById('fromInput');
  const toInput   = document.getElementById('toInput');
  const viewBtn   = document.getElementById('viewBtn');

  // 1️⃣ Load sidebar Mã Trạm
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

    // Mặc định active “Tất cả”
    ul.querySelector('li[data-id=""]').classList.add('active');
  }

  // 2️⃣ Fetch dữ liệu từ Function, có lọc ID, from, to
  async function fetchData() {
    const params = [];
    if (fromInput.value) params.push(`from=${encodeURIComponent(fromInput.value)}`);
    if (toInput.value)   params.push(`to=${encodeURIComponent(toInput.value)}`);
    if (selectedId)      params.push(`id=${encodeURIComponent(selectedId)}`);

    let url = '/.netlify/functions/get-data';
    if (params.length) url += '?' + params.join('&');

    const res  = await fetch(url);
    const data = await res.json();

    renderTable(data);
    renderCharts(data);
  }

  // 3️⃣ Render bảng, luôn có cột ID
  function renderTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    // Nếu đã chọn ID thì giới hạn 10, không thì 30
    const limit = selectedId ? 10 : 30;

    data.slice(0, limit).forEach(r => {
      const tr = document.createElement('tr');

      // ❗ Cột ID
      const tdId = document.createElement('td');
      tdId.textContent = r.id;
      tr.appendChild(tdId);

      // Các cột còn lại
      ['date','time','mucnuoc','vol','cbe1x4x'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = r[key];
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  // 4️⃣ Render / cập nhật Chart.js cho mực nước & điện áp
  function renderCharts(data) {
    const labels    = data.map(r => `${r.date} ${r.time}`);
    const waterData = data.map(r => Number(r.mucnuoc));
    const voltData  = data.map(r => Number(r.vol));

    // – Biểu đồ Mực nước
    if (!waterChart) {
      waterChart = new Chart(
        document.getElementById('myChart').getContext('2d'),
        {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Mực nước (cm)',
              data: waterData,
              fill: false,
              borderWidth: 2
            }]
          },
          options: { responsive: true }
        }
      );
    } else {
      waterChart.data.labels = labels;
      waterChart.data.datasets[0].data = waterData;
      waterChart.update();
    }

    // – Biểu đồ Điện áp
    if (!voltChart) {
      voltChart = new Chart(
        document.getElementById('voltChart').getContext('2d'),
        {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Điện áp (VoL)',
              data: voltData,
              fill: false,
              borderWidth: 2
            }]
          },
          options: { responsive: true }
        }
      );
    } else {
      voltChart.data.labels = labels;
      voltChart.data.datasets[0].data = voltData;
      voltChart.update();
    }
  }

  // 5️⃣ Khởi tạo
  viewBtn.addEventListener('click', fetchData);
  loadStations();
  fetchData();
});
