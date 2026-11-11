
from flask import Flask, jsonify, request, send_from_directory
from pathlib import Path
from uuid import uuid4

app = Flask(__name__)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

tasks = [
    {"id": "1", "title": "Tim hieu Docker", "done": False},
    {"id": "2", "title": "Thiet ke Kubernetes Cluster", "done": True},
]

@app.get("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.get("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

@app.get("/health")
@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "task-backend"})

@app.get("/api/tasks")
def get_tasks():
    return jsonify(tasks)

@app.post("/api/tasks")
def add_task():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()

    if not title:
        return jsonify({"error": "title is required"}), 400

    task = {"id": str(uuid4()), "title": title, "done": False}
    tasks.append(task)
    return jsonify(task), 201

@app.patch("/api/tasks/<task_id>")
def update_task(task_id):
    data = request.get_json(silent=True) or {}

    for task in tasks:
        if task["id"] == task_id:
            task["done"] = bool(data.get("done", not task["done"]))
            return jsonify(task)

    return jsonify({"error": "task not found"}), 404

@app.delete("/api/tasks/<task_id>")
def delete_task(task_id):
    global tasks

    before = len(tasks)
    tasks = [task for task in tasks if task["id"] != task_id]

    if len(tasks) == before:
        return jsonify({"error": "task not found"}), 404

    return jsonify({"deleted": task_id})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
