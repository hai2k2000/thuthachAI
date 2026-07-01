# Test Plan

- Chạy `npm install` nếu thiếu dependencies.
- Chạy `npm run lint`.
- Chạy `npm run build`.
- Chạy `npm run test`.
- Kiểm tra `POST /api/submissions` bằng multipart form có file minh chứng.
- Kiểm tra `GET /api/submissions/export.csv` yêu cầu token quản trị.
- Kiểm tra các route chính bằng trình duyệt hoặc curl qua Nginx.
- Kiểm tra search/filter/copy prompt trên trình duyệt.
- Kiểm tra detail route `/challenges/:id`, `/prompts/:id`, `/featured/:id`.
- Kiểm tra mobile responsive bằng viewport hẹp.
