import sqlite3
import os
from datetime import datetime, timezone
from flask import Flask, jsonify, request, render_template, abort, send_from_directory, send_file

app = Flask(__name__)

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')

DB_PATH = os.path.join(os.path.dirname(__file__), "goals.db")

MOTIVATIONAL_MESSAGES = {
    "empty": "Every journey begins with a single step. Add your first goal!",
    "low": "Great start! Keep the momentum going — you can do it!",
    "medium": "You're making real progress. Stay focused and keep pushing!",
    "high": "Almost there! Just a little more effort — the finish line is in sight!",
    "complete": "Amazing! You've achieved all your goals. Set new ones to keep growing!",
}


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS goals (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                title       TEXT    NOT NULL,
                description TEXT    DEFAULT '',
                target      INTEGER NOT NULL DEFAULT 100,
                progress    INTEGER NOT NULL DEFAULT 0,
                completed   INTEGER NOT NULL DEFAULT 0,
                created_at  TEXT    NOT NULL,
                updated_at  TEXT    NOT NULL
            )
            """
        )
        conn.commit()


def goal_to_dict(row) -> dict:
    d = dict(row)
    d["completed"] = bool(d["completed"])
    d["completion_pct"] = (
        round(d["progress"] / d["target"] * 100) if d["target"] > 0 else 0
    )
    return d


# ---------------------------------------------------------------------------
# Routes – UI
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return render_template("index.html")


# ---------------------------------------------------------------------------
# Routes – API
# ---------------------------------------------------------------------------

@app.route("/api/goals", methods=["GET"])
def list_goals():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM goals ORDER BY completed ASC, created_at DESC"
        ).fetchall()
    return jsonify([goal_to_dict(r) for r in rows])


@app.route("/api/goals", methods=["POST"])
def create_goal():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        abort(400, description="title is required")
    description = (data.get("description") or "").strip()
    target = int(data.get("target") if data.get("target") is not None else 100)
    if target < 1:
        abort(400, description="target must be at least 1")
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO goals (title, description, target, progress, completed, created_at, updated_at) "
            "VALUES (?, ?, ?, 0, 0, ?, ?)",
            (title, description, target, now, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM goals WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(goal_to_dict(row)), 201


@app.route("/api/goals/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    data = request.get_json(silent=True) or {}
    with get_db() as conn:
        row = conn.execute("SELECT * FROM goals WHERE id = ?", (goal_id,)).fetchone()
        if row is None:
            abort(404, description="goal not found")
        title = (data.get("title") or row["title"]).strip()
        if not title:
            abort(400, description="title is required")
        description = (data.get("description", row["description"]) or "").strip()
        target = int(data.get("target", row["target"]))
        if target < 1:
            abort(400, description="target must be at least 1")
        progress = int(data.get("progress", row["progress"]))
        progress = max(0, min(progress, target))
        completed = 1 if (data.get("completed", bool(row["completed"]))) else 0
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "UPDATE goals SET title=?, description=?, target=?, progress=?, completed=?, updated_at=? WHERE id=?",
            (title, description, target, progress, completed, now, goal_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM goals WHERE id = ?", (goal_id,)).fetchone()
    return jsonify(goal_to_dict(row))


@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    with get_db() as conn:
        row = conn.execute("SELECT id FROM goals WHERE id = ?", (goal_id,)).fetchone()
        if row is None:
            abort(404, description="goal not found")
        conn.execute("DELETE FROM goals WHERE id = ?", (goal_id,))
        conn.commit()
    return jsonify({"deleted": goal_id})


@app.route("/api/goals/<int:goal_id>/complete", methods=["PATCH"])
def complete_goal(goal_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM goals WHERE id = ?", (goal_id,)).fetchone()
        if row is None:
            abort(404, description="goal not found")
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "UPDATE goals SET completed=1, progress=target, updated_at=? WHERE id=?",
            (now, goal_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM goals WHERE id = ?", (goal_id,)).fetchone()
    return jsonify(goal_to_dict(row))


@app.route("/api/stats", methods=["GET"])
def stats():
    with get_db() as conn:
        total = conn.execute("SELECT COUNT(*) FROM goals").fetchone()[0]
        completed = conn.execute(
            "SELECT COUNT(*) FROM goals WHERE completed=1"
        ).fetchone()[0]
    pct = round(completed / total * 100) if total > 0 else 0
    if total == 0:
        message = MOTIVATIONAL_MESSAGES["empty"]
    elif pct == 100:
        message = MOTIVATIONAL_MESSAGES["complete"]
    elif pct >= 70:
        message = MOTIVATIONAL_MESSAGES["high"]
    elif pct >= 40:
        message = MOTIVATIONAL_MESSAGES["medium"]
    else:
        message = MOTIVATIONAL_MESSAGES["low"]
    return jsonify(
        {
            "total": total,
            "completed": completed,
            "active": total - completed,
            "completion_pct": pct,
            "message": message,
        }
    )


@app.errorhandler(400)
@app.errorhandler(404)
def handle_error(e):
    return jsonify({"error": e.description}), e.code


# Serve React static assets
@app.route('/assets/<path:filename>')
def serve_assets(filename: str):
    if os.path.exists(FRONTEND_DIST):
        return send_from_directory(os.path.join(FRONTEND_DIST, 'assets'), filename)
    abort(404)


# Catch-all: serve React app for all non-API routes
@app.route('/<path:path>')
def serve_react(path: str):
    if path.startswith('api/'):
        abort(404)
    index_path = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.exists(index_path):
        return send_file(index_path)
    abort(404)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    init_db()
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, port=5000)
