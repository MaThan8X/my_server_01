// 3.1. Lấy DOM elements
const dateFromEl = document.getElementById('dateFrom')   // input ngày bắt đầu
const dateToEl   = document.getElementById('dateTo')     // input ngày kết thúc
const btnLoad    = document.getElementById('btnLoad')    // nút Xem
const tableBody  = document.querySelector('#datatable tbody') // tbody của table
const ctx        = document.getElementById('chart').getContext('2d') // context Chart.js

// 3.2. Khởi tạo Chart.js để vẽ line chart mực nước
let lineChart = new Chart(ctx, {
  type: 'line',         // Kiểu biểu đồ: đường
  data: {
    labels: [],         // Mảng thời gian (Time)
    datasets: [{
      label: 'Mực nước (cm)',  // Nhãn dataset
      data: [],               // Mảng giá trị mucnuoc
      fill: false,            // Không tô màu phía dưới đường
      tension: 0.1            // Độ cong đường
    }]
  },
  options: {
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Giờ' } // Nhãn trục X
      },
      y: {
        display: true,
        title: { display: true, text: 'Mực nước (cm)' } // Nhãn trục Y
      }
    }
  }
})

// 3.3. Hàm loadData: fetch API, filter, render table + chart
async function loadData() {
  // 3.3.1. Fetch tất cả bản ghi từ backend
  const res = await fetch('/api/data')
  const records = await res.json() // mảng các object

  // 3.3.2. Tính timestamp từ – đến
  let fromTs = -Infinity
  let toTs   = Infinity
  if (dateFromEl.value) {
    fromTs = new Date(dateFromEl.value).getTime() / 1000
  }
  if (dateToEl.value) {
    // Cộng thêm 23:59:59 để bao cả ngày đến
    toTs = new Date(dateToEl.value).getTime() / 1000 + 86399
  }

  // 3.3.3. Filter theo khoảng timestamp
  const filtered = records.filter(r => {
    // Ghép date + time thành Date object
    const ts = new Date(`${r.date} ${r.time}`).getTime() / 1000
    return ts >= fromTs && ts <= toTs
  })

  // 3.3.4. Render bảng 6 cột
  tableBody.innerHTML = ''  // Xóa rows cũ
  filtered.forEach(r => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.mucnuoc}</td>
      <td>${r.vol}</td>
      <td>${r.cbe1x4x}</td>
    `
    tableBody.appendChild(tr)
  })

  // 3.3.5. Cập nhật dữ liệu cho Chart.js
  lineChart.data.labels = filtered.map(r => r.time)       // Mảng giờ
  lineChart.data.datasets[0].data = filtered.map(r => r.mucnuoc) // Mảng mucnuoc
  lineChart.update()  // Vẽ lại biểu đồ
}

// 3.4. Gán event cho nút Xem
btnLoad.addEventListener('click', loadData)

// 3.5. Tự động load khi trang vừa mở
loadData()
