// routes/api.js

const express = require('express')
const router  = express.Router()

// GET /api/data/send
router.get('/data/send', async (req, res) => {
  try {
    // 1. Lấy raw query string sau dấu '?'
    //    ví dụ: "id=F01774;date=07/05/2025;time=14:30;..."
    const rawQuery = req.url.split('?')[1] || ''

    // 2. Split cả '&' và ';' thành các cặp "key=value"
    const pairs = rawQuery.split(/[&;]/).filter(Boolean)

    // 3. Chuyển thành object params
    const params = {}
    pairs.forEach(pair => {
      const [key, val] = pair.split('=')
      if (key) params[key] = val
    })

    // 4. Lấy chính xác 6 tham số
    const { id, date, time, mucnuoc, vol, cbe1x4x } = params

    // 5. Kiểm tra bắt buộc
    if (!id || !date || !time || !mucnuoc || !vol || !cbe1x4x) {
      return res
        .status(400)
        .json({ error: 'Thiếu tham số: id, date, time, mucnuoc, vol, cbe1x4x' })
    }

    // 6. Log để debug
    console.log('Nhận từ SIM (parsed):', params)

    // TODO: Append vào Excel hoặc DB...

    // 7. Trả về xác nhận
    return res
      .status(201)
      .json({ status: 'received', ...params })
  } catch (err) {
    console.error('❌ Lỗi /api/data/send:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
