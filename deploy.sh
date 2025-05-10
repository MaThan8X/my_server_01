#!/bin/bash
# deploy.sh – Triển khai code lên Netlify

# 0. Đảm bảo đã cài Netlify CLI nếu chưa:
# npm install -g netlify-cli

# 1. Đăng nhập vào Netlify
#    Lệnh này sẽ mở trình duyệt để Chủ Nhân xác thực.
netlify login                                   # Đăng nhập tài khoản Netlify

# 2. Kết nối thư mục dự án hiện tại với site Netlify đã tạo
#    Thay YOUR_SITE_ID thành ID của site (xem trên dashboard Netlify).
netlify link --id YOUR_SITE_ID                  # Liên kết dự án với site Netlify

# 3. Tạo bản deploy Preview (không lên production)
#    --dir chỉ thư mục tĩnh (public), --functions chỉ thư mục functions
netlify deploy \
  --dir=public \
  --functions=netlify/functions \
  --message="Preview: Cập nhật Dashboard Mã Trạm"   # Triển khai bản thử nghiệm

# 4. Nếu Preview OK, tiến hành deploy lên Production
netlify deploy --prod \
  --dir=public \
  --functions=netlify/functions \
  --message="Release: Cập nhật Dashboard Mã Trạm"  # Đẩy lên môi trường chính

# 5. Kết thúc
echo "✅ Đã hoàn tất deploy lên Netlify."
