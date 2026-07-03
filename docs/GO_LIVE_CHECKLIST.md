# Go-live checklist Thử thách AI

## Trước khi mở public

- Đổi `ADMIN_PASSWORD`, `SUBMISSIONS_ADMIN_TOKEN` và `COMMUNITY_VOTE_SECRET` trong `/etc/ai-challenge-hub.env`.
- Kiểm tra domain `https://thuthachai.io.vn` trỏ đúng VPS và SSL còn hiệu lực.
- Chạy `npm run test`, `npm run lint`, `npm run build` trong `/opt/ai-challenge-hub`.
- Kiểm tra API: `curl https://thuthachai.io.vn/api/submissions/health`.
- Đăng nhập trang quản trị, thử xem danh sách bài dự thi, user, liên hệ và chấm điểm.
- Gửi thử một bài dự thi có file bài làm, file minh chứng và ảnh đại diện.
- Bình chọn thử một bài tiêu biểu bằng trình duyệt thường và ẩn danh để xác nhận giới hạn 1 máy/1 bài.

## User hệ thống và quyền thư mục

- Tạo user chạy service nếu chưa có: `useradd --system --home-dir /opt/ai-challenge-hub --shell /usr/sbin/nologin aichallenge`.
- Cấp quyền ghi dữ liệu runtime: `chown -R aichallenge:aichallenge /opt/ai-challenge-hub/storage`.
- Copy `deploy/ai-challenge-api.service` vào `/etc/systemd/system/`, chạy `systemctl daemon-reload`, rồi restart service.
- Kiểm tra API không chạy bằng root: `systemctl show ai-challenge-api -p User -p Group`.

## Biến môi trường cần rà soát

- `PUBLIC_BASE_URL=https://thuthachai.io.vn`
- `PORT=4310`
- `HOST=127.0.0.1`
- `SUBMISSIONS_DATA_DIR=/opt/ai-challenge-hub/storage`
- `MAX_UPLOAD_MB=25`
- `MAX_UPLOAD_FILES=5`
- `MAX_SUBMISSION_FILES=3`
- `RATE_LIMIT_ADMIN_LOGIN_MAX=10`
- `RATE_LIMIT_ADMIN_LOGIN_WINDOW_MS=900000`
- `RATE_LIMIT_SUBMISSIONS_MAX=8`
- `RATE_LIMIT_SUBMISSIONS_WINDOW_MS=3600000`
- `RATE_LIMIT_CONTACT_MAX=10`
- `RATE_LIMIT_CONTACT_WINDOW_MS=900000`
- `RATE_LIMIT_COMMUNITY_VOTE_MAX=60`
- `RATE_LIMIT_COMMUNITY_VOTE_WINDOW_MS=900000`
- `RATE_LIMIT_FORUM_MAX=20`
- `RATE_LIMIT_FORUM_WINDOW_MS=900000`
- `BACKUP_DIR=/opt/ai-challenge-hub/storage/backups`
- `BACKUP_RETENTION_DAYS=14`

## Backup và khôi phục

- Backup thủ công: `node /opt/ai-challenge-hub/scripts/backup-production.mjs`.
- Bật backup hằng ngày: copy `deploy/ai-challenge-backup.service` và `deploy/ai-challenge-backup.timer` vào `/etc/systemd/system/`, sau đó chạy `systemctl daemon-reload` và `systemctl enable --now ai-challenge-backup.timer`.
- Xem lịch backup: `systemctl list-timers ai-challenge-backup.timer`.
- File backup nằm trong `/opt/ai-challenge-hub/storage/backups` và có dạng `ai-challenge-hub-YYYYMMDD-HHMMSS.tar.gz`.
- Khi cần khôi phục, dừng API bằng `systemctl stop ai-challenge-api`, giải nén backup vào thư mục tạm, copy `submissions.sqlite` và thư mục `uploads` về `/opt/ai-challenge-hub/storage`, rồi chạy `systemctl start ai-challenge-api`.

## Theo dõi sau khi chạy thật

- Xem log API: `journalctl -u ai-challenge-api -n 100 --no-pager`.
- Xem log backup: `journalctl -u ai-challenge-backup -n 100 --no-pager`.
- Theo dõi dung lượng: `du -sh /opt/ai-challenge-hub/storage`.
- Mỗi ngày kiểm tra có file backup mới, API health còn `ok: true`, và không có lỗi upload lớn trong log nginx/API.
