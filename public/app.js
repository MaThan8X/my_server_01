// 1. Chờ DOM load xong mới bind event và khởi tạo
document.addEventListener('DOMContentLoaded', () => {
  // 2. Lấy các phần tử trên trang
  const fromInput = document.getElementById('fromInput')   // Ô nhập ngày “Từ”
  const toInput   = document.getElementById('toInput')     // Ô nhập ngày “Đến”
  const viewBtn   = document.getElementById('viewBtn')     // Nút “Xem”
  const tableBody = document.getElementById('table-body')  // <tbody> của bảng số liệu
  const canvas    = document.getElementById('myChart')     // <canvas> cho Chart.js

  let myChart = null                                    // Biến lưu instance Chart để cập nhật

  /** 
   * 3. Hàm lấy dữ liệu từ Netlify Function get-data
   *    Gọi URL dạng:
   *      /.netlify/functions/get-data?from=DD%2FMM%2FYYYY&to=...
   */
  async function fetchData() {
    // 3.1. Đọc giá trị “Từ” và “Đến”, mã hóa URL
    const from = encodeURIComponent(fromInput.value)  
    const to   = encodeURIComponent(toInput.value)

    // 3.2. Tạo URL endpoint
    const url = `/.netlify/functions/get-data?from=${from}&to=${to}`

    try {
      // 3.3. Gọi fetch, chờ kết quả JSON
      const res  = await fetch(url)
      const data = await res.json()

      // 3.4. Nếu có lỗi từ API, báo console
      if (!res.ok) {
        console.error('API lỗi:', data.error)
        return
      }

      // 3.5. Gửi dữ liệu về 2 hàm render
      renderTable(data)
      renderChart(data)
    } catch (err) {
      console.error('Lỗi fetchData():', err)
    }
  }

  /**
   * 4. Hàm vẽ bảng số liệu
   *    Xóa sạch <tbody> cũ, đổ từng bản ghi vào một <tr>
   */
  function renderTable(data) {
    // 4.1. Xóa hết các dòng cũ
    tableBody.innerHTML = ''

    // 4.2. Duyệt mảng data, mỗi phần tử là một bản ghi
    data.forEach(record => {
      // 4.3. Tạo <tr> mới
      const tr = document.createElement('tr')

      // 4.4. Tạo 6 <td> tương ứng: ID, date, time, mucnuoc, vol, cbe1x4x
      ;['id','date','time','mucnuoc','vol','cbe1x4x'].forEach(key => {
        const td = document.createElement('td')
        td.textContent = record[key]  // gán text
        tr.appendChild(td)            // chèn vào tr
      })

      // 4.5. Đưa tr vào tbody
      tableBody.appendChild(tr)
    })

    // 4.6. Nếu >20 dòng, bật scroll (CSS đã cài sẵn)
  }

  /**
   * 5. Hàm vẽ đồ thị Chart.js
   *    Lấy mảng thời gian (time) và mảng mực nước (mucnuoc)
   */
  function renderChart(data) {
    // 5.1. Lấy labels và values
    const labels = data.map(r => r.time)           // mảng thời gian
    const values = data.map(r => Number(r.mucnuoc))// mảng mực nước (số)

    // 5.2. Nếu đã khởi Chart rồi, huỷ nó để vẽ mới
    if (myChart) {
      myChart.destroy()
    }

    // 5.3. Tạo Chart mới
    myChart = new Chart(canvas.getContext('2d'), {
      type: 'line',             // hoặc 'bar' tuỳ ý
      data: {
        labels,
        datasets: [{
          label: 'Mực nước (cm)',
          data: values,
          fill: false,         // không tô dưới đường
          borderWidth: 2        // độ dày đường
        }]
      },
      options: {
        scales: {
          x: { 
            title: { display: true, text: 'Giờ' } 
          },
          y: { 
            title: { display: true, text: 'Mực nước (cm)' },
            beginAtZero: true 
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }

  // 6. Bắt sự kiện click nút “Xem”
  viewBtn.addEventListener('click', fetchData)

  // 7. Tự động load dữ liệu khi mở trang
  fetchData()
})
