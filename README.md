# Nhóm 3 - Task Management (bộ khởi động báo cáo tiến độ)

## Mục tiêu của bộ mã nguồn
- Frontend: HTML/CSS/JavaScript, Nginx phục vụ giao diện.
- Backend: Python Flask cung cấp REST API.
- Chạy thử local bằng Docker Compose.
- Có manifest Kubernetes dạng khung để nhóm tiếp tục hoàn thiện.

## Lưu ý trung thực về trạng thái
Bộ mã nguồn này là điểm bắt đầu. Chỉ ghi "đã chạy thành công" sau khi nhóm tự chạy và kiểm tra được.
Bản demo hiện tại lưu công việc trong bộ nhớ của từng tiến trình backend. Dữ liệu có thể mất khi container khởi động lại và không được đồng bộ giữa nhiều backend replicas. Vì vậy:
- Dùng để minh họa luồng Frontend -> Backend trong buổi báo cáo tiến độ.
- Chưa phải thiết kế dữ liệu hoàn chỉnh cho môi trường Kubernetes nhiều replicas.
- Việc tích hợp PostgreSQL và kiểm thử dữ liệu dùng chung là phần cần làm tiếp.

## 1. Chạy trực tiếp không cần Docker (nếu đã cài Python)
Mở terminal trong thư mục `backend`:
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Backend chạy tại http://localhost:5000/health

Mở `frontend/index.html` trực tiếp sẽ không gọi được API qua Nginx proxy. Cách khuyến nghị là dùng Docker Compose.

## 2. Chạy bằng Docker Compose
Cần cài Docker Desktop và bật Docker Engine.
Tại thư mục gốc dự án:
```bash
docker compose up --build -d
docker compose ps
```
Mở http://localhost:8080

Kiểm tra API:
```bash
curl http://localhost:8080/api/health
```
Windows PowerShell có thể dùng:
```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

Xem log:
```bash
docker compose logs -f
```
Dừng:
```bash
docker compose down
```

## 3. Build image riêng
Thay `DOCKERHUB_USERNAME` bằng tài khoản Docker Hub của nhóm:
```bash
docker build -t DOCKERHUB_USERNAME/task-backend:v1 ./backend
docker build -t DOCKERHUB_USERNAME/task-frontend:v1 ./frontend
docker login
docker push DOCKERHUB_USERNAME/task-backend:v1
docker push DOCKERHUB_USERNAME/task-frontend:v1
```
Không dùng tag `latest` theo yêu cầu đề bài. Chỉ báo cáo đã push khi image xuất hiện trên Docker Hub.

## 4. Kubernetes
Các file trong `k8s/` là bản khung để tiếp tục sau khi có cluster và image trên registry.
1. Sửa `DOCKERHUB_USERNAME` trong `k8s/app.yaml`.
2. Kiểm tra cấu hình phù hợp cluster của nhóm.
3. Chỉ chạy `kubectl apply -f k8s/app.yaml` khi đã có cluster hoạt động và image đã push.
4. Kiểm tra:
```bash
kubectl get nodes -o wide
kubectl get pods -n task-app -o wide
kubectl get deployments,services -n task-app
```
Manifest có 2 replicas cho mỗi Deployment và topology spread constraint để yêu cầu phân bố Pod trên các hostname. Nếu node không đủ tài nguyên hoặc cluster chưa có 2 worker Ready, Pod có thể Pending.

## 5. Phần còn phải hoàn thiện để đáp ứng đề
- Dựng 3 VM cloud: 1 control plane, 2 worker.
- Cài Kubernetes bằng kubeadm và CNI.
- Xác nhận 3 node ở trạng thái Ready.
- Push image v1 lên registry.
- Triển khai namespace, deployment, service.
- Bổ sung database dùng chung (ví dụ PostgreSQL) trước khi kiểm thử nhiều backend replicas thực sự.
- Kiểm tra Pod phân bố trên cả 2 worker.
- Scale một Deployment lên 4 replicas.
- Build/push image phiên bản mới (v2), update và rollback.
- Tắt một worker, quan sát và ghi nhận kết quả.
