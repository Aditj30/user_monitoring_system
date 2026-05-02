import os
import re
import random
import string
from datetime import datetime
from functools import wraps

import bcrypt
import mysql.connector
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
app.secret_key = os.getenv("SECRET_KEY", "dev-secret")

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "user_monitoring_db"),
        charset="utf8mb4"
    )

def get_client_ip():
    return request.headers.get("X-Forwarded-For", request.remote_addr)

def get_device_info():
    return request.headers.get("User-Agent", "Unknown")

def hash_password(plain):
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def check_password(plain, hashed):
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def validate_email(email):
    return bool(re.match(r"^[\w.+-]+@[\w-]+\.[a-z]{2,}$", email, re.IGNORECASE))

def validate_password(pw):
    return len(pw) >= 8 and any(c.isupper() for c in pw) and any(c.isdigit() for c in pw)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login_page"))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login_page"))
        if session.get("role_id") != 1:
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated

# ── Page Routes ──────────────────────────────────────
@app.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("admin_dashboard") if session.get("role_id") == 1 else url_for("user_dashboard"))
    return redirect(url_for("login_page"))

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/dashboard")
@login_required
def user_dashboard():
    if session.get("role_id") == 1:
        return redirect(url_for("admin_dashboard"))
    return redirect("http://localhost:3000/dashboard")

@app.route("/otp")
def otp_page():
    return render_template("otp.html")

@app.route("/admin")
@login_required
def admin_dashboard():
    if session.get("role_id") != 1:
        return redirect(url_for("user_dashboard"))
    return redirect("http://localhost:3000/admin")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("http://localhost:3000/login")

# ── Auth APIs ─────────────────────────────────────────
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(force=True)
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or len(name) < 2:
        return jsonify({"error": "Name must be at least 2 characters"}), 400
    if not validate_email(email):
        return jsonify({"error": "Invalid email address"}), 400
    if not validate_password(password):
        return jsonify({"error": "Password needs 8+ chars, 1 uppercase, 1 digit"}), 400

    pw_hash = hash_password(password)
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            "INSERT INTO Users (name, email, password_hash, role_id) VALUES (%s, %s, %s, 2)",
            (name, email, pw_hash)
        )
        db.commit()
        return jsonify({"message": "Registration successful"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409
    finally:
        cur.close()
        db.close()

@app.route("/api/login", methods=["POST"])
def api_login():
    data       = request.get_json(force=True)
    email      = (data.get("email") or "").strip().lower()
    password   = data.get("password") or ""
    ip_address = get_client_ip()
    device     = get_device_info()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        # Fetch user
        cur.execute(
            "SELECT user_id, name, email, password_hash, role_id, account_status FROM Users WHERE email = %s",
            (email,)
        )
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        if user["account_status"] != "active":
            return jsonify({"error": "Account is not active"}), 403

        # Check cooldown
        cur.execute(
            "SELECT cooldown_until, attempt_count FROM Failed_Attempts WHERE user_id = %s",
            (user["user_id"],)
        )
        fa = cur.fetchone()
        if fa and fa["cooldown_until"] and fa["cooldown_until"] > datetime.now():
            remaining = int((fa["cooldown_until"] - datetime.now()).total_seconds())
            return jsonify({"error": f"Too many failed attempts. Try again in {remaining} seconds."}), 429

        # Verify password
        if not check_password(password, user["password_hash"]):
            cur.execute(
                "INSERT INTO Login_History (user_id, ip_address, device_info, login_status, suspicious_flag) VALUES (%s, %s, %s, 'failure', 0)",
                (user["user_id"], ip_address, device)
            )
            db.commit()
            attempts = (fa["attempt_count"] + 1) if fa else 1
            left = max(0, 3 - attempts)
            msg = "Invalid credentials. Cooldown applied." if left == 0 else f"Invalid credentials. {left} attempt(s) left."
            return jsonify({"error": msg}), 401

        # Suspicious detection
        cur.execute(
            "SELECT device_id FROM User_Device WHERE user_id = %s AND device_info = %s",
            (user["user_id"], device)
        )
        known_device = cur.fetchone()

        cur.execute(
            "SELECT ip_address FROM Login_History WHERE user_id = %s AND login_status = 'success' ORDER BY login_time DESC LIMIT 10",
            (user["user_id"],)
        )
        known_ips = {row["ip_address"] for row in cur.fetchall()}
        is_suspicious = int(not known_device or ip_address not in known_ips)

        # Record success — trigger resets Failed_Attempts
        cur.execute(
            "INSERT INTO Login_History (user_id, ip_address, device_info, login_status, suspicious_flag) VALUES (%s, %s, %s, 'success', %s)",
            (user["user_id"], ip_address, device, is_suspicious)
        )

        # Register or update device
        if not known_device:
            cur.execute(
                "INSERT INTO User_Device (user_id, device_info) VALUES (%s, %s)",
                (user["user_id"], device)
            )
        else:
            cur.execute(
                "UPDATE User_Device SET last_seen = NOW() WHERE user_id = %s AND device_info = %s",
                (user["user_id"], device)
            )

        db.commit()

        return jsonify({
            "message": "Password verified. OTP required.",
            "suspicious": bool(is_suspicious),
            "redirect": f"/otp?user_id={user['user_id']}"
        }), 200

    finally:
        cur.close()
        db.close()

# ── User APIs ─────────────────────────────────────────
@app.route("/api/me")
@login_required
def api_me():
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT u.user_id, u.name, u.email, u.created_at, u.account_status, r.role_name FROM Users u JOIN Roles r ON u.role_id = r.role_id WHERE u.user_id = %s",
            (session["user_id"],)
        )
        user = cur.fetchone()
        if user and user.get("created_at"):
            user["created_at"] = str(user["created_at"])
        return jsonify(user)
    finally:
        cur.close()
        db.close()

@app.route("/api/my-logins")
@login_required
def api_my_logins():
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.callproc("GetUserLoginHistory", [session["user_id"]])
        rows = []
        for result in cur.stored_results():
            rows = result.fetchall()
        for row in rows:
            if row.get("login_time"):
                row["login_time"] = str(row["login_time"])
        return jsonify(rows)
    finally:
        cur.close()
        db.close()

# ── Admin APIs ────────────────────────────────────────
@app.route("/api/admin/users")
@admin_required
def api_admin_users():
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT u.user_id, u.name, u.email, r.role_name,
                   u.account_status, u.created_at,
                   COUNT(lh.login_id) AS total_logins,
                   SUM(lh.login_status = 'failure') AS failed_logins,
                   SUM(lh.suspicious_flag) AS suspicious_logins,
                   fa.attempt_count, fa.cooldown_until
            FROM Users u
            JOIN Roles r ON u.role_id = r.role_id
            LEFT JOIN Login_History lh ON u.user_id = lh.user_id
            LEFT JOIN Failed_Attempts fa ON u.user_id = fa.user_id
            GROUP BY u.user_id, u.name, u.email, r.role_name,
                     u.account_status, u.created_at, fa.attempt_count, fa.cooldown_until
            ORDER BY u.created_at DESC
        """)
        rows = cur.fetchall()
        for row in rows:
            for key in ("created_at", "cooldown_until"):
                if row.get(key):
                    row[key] = str(row[key])
        return jsonify(rows)
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/login-history")
@admin_required
def api_admin_login_history():
    user_id = request.args.get("user_id", type=int)
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        if user_id:
            cur.callproc("GetUserLoginHistory", [user_id])
            rows = []
            for result in cur.stored_results():
                rows = result.fetchall()
        else:
            cur.execute("""
                SELECT lh.login_id, u.name AS user_name, u.email,
                       lh.login_time, lh.ip_address, lh.device_info,
                       lh.login_status, lh.suspicious_flag
                FROM Login_History lh
                JOIN Users u ON lh.user_id = u.user_id
                ORDER BY lh.login_time DESC LIMIT 200
            """)
            rows = cur.fetchall()
        for row in rows:
            if row.get("login_time"):
                row["login_time"] = str(row["login_time"])
        return jsonify(rows)
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/suspicious")
@admin_required
def api_admin_suspicious():
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM suspicious_login_view LIMIT 100")
        rows = cur.fetchall()
        for row in rows:
            if row.get("login_time"):
                row["login_time"] = str(row["login_time"])
        return jsonify(rows)
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/stats")
@admin_required
def api_admin_stats():
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        stats = {}
        cur.execute("SELECT COUNT(*) AS cnt FROM Users WHERE role_id = 2")
        stats["total_users"] = cur.fetchone()["cnt"]
        cur.execute("SELECT COUNT(*) AS cnt FROM Login_History WHERE DATE(login_time) = CURDATE()")
        stats["logins_today"] = cur.fetchone()["cnt"]
        cur.execute("SELECT COUNT(*) AS cnt FROM Login_History WHERE suspicious_flag = 1 AND DATE(login_time) = CURDATE()")
        stats["suspicious_today"] = cur.fetchone()["cnt"]
        cur.execute("SELECT COUNT(*) AS cnt FROM Login_History WHERE login_status='failure' AND DATE(login_time) = CURDATE()")
        stats["failed_today"] = cur.fetchone()["cnt"]
        cur.execute("SELECT COUNT(*) AS cnt FROM Failed_Attempts WHERE cooldown_until > NOW()")
        stats["users_in_cooldown"] = cur.fetchone()["cnt"]
        return jsonify(stats)
    finally:
        cur.close()
        db.close()

# ── OTP APIs ──────────────────────────────────────────
@app.route("/api/generate-otp", methods=["POST"])
def api_generate_otp():
    data    = request.get_json(force=True)
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    otp_code = ''.join(random.choices(string.digits, k=6))

    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        # Manually clean expired OTPs
        cur.execute(
            "DELETE FROM OTP WHERE user_id = %s AND expiry_time < NOW()",
            (user_id,)
        )
        db.commit()

        # Trigger fires here — marks remaining unused OTPs as used
        cur.execute(
            "INSERT INTO OTP (user_id, otp_code, expiry_time) VALUES (%s, %s, DATE_ADD(NOW(), INTERVAL 5 MINUTE))",
            (user_id, otp_code)
        )
        db.commit()

        return jsonify({
            "message": "OTP generated",
            "otp": otp_code,
            "expires_in": "5 minutes"
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        db.close()

@app.route("/api/verify-otp", methods=["POST"])
def api_verify_otp():
    """
    Verifies OTP — checks it exists, belongs to user, not expired, not used.
    On success → creates session.
    """
    data     = request.get_json(force=True)
    user_id  = data.get("user_id")
    otp_code = data.get("otp_code", "").strip()

    if not user_id or not otp_code:
        return jsonify({"error": "user_id and otp_code required"}), 400

    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT otp_id FROM OTP
            WHERE user_id = %s
            AND otp_code = %s
            AND expiry_time > NOW()
            AND is_used = 0
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (user_id, otp_code)
        )
        otp = cur.fetchone()

        if not otp:
            return jsonify({"error": "Invalid or expired OTP"}), 401

        # Mark OTP as used
        cur.execute(
            "UPDATE OTP SET is_used = 1 WHERE otp_id = %s",
            (otp["otp_id"],)
        )

        # Now create session
        cur.execute(
            "SELECT user_id, name, email, role_id FROM Users WHERE user_id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        db.commit()

        session["user_id"] = user["user_id"]
        session["name"]    = user["name"]
        session["email"]   = user["email"]
        session["role_id"] = user["role_id"]

        return jsonify({
            "message": "OTP verified successfully",
            "redirect": "/admin" if user["role_id"] == 1 else "/dashboard"
        }), 200

    finally:
        cur.close()
        db.close()

# ── Admin Management APIs ─────────────────────────────

@app.route("/api/admin/kill-cooldown", methods=["POST"])
@admin_required
def api_kill_cooldown():
    data    = request.get_json(force=True)
    user_id = data.get("user_id")
    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "UPDATE Failed_Attempts SET attempt_count=0, last_failed_time=NULL, cooldown_until=NULL WHERE user_id=%s",
            (user_id,)
        )
        db.commit()
        return jsonify({"message": "Cooldown cleared"}), 200
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/delete-login", methods=["POST"])
@admin_required
def api_admin_delete_login():
    data     = request.get_json(force=True)
    login_id = data.get("login_id")
    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute("DELETE FROM Login_History WHERE login_id = %s", (login_id,))
        db.commit()
        return jsonify({"message": "Login record deleted"}), 200
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/delete-user", methods=["POST"])
@admin_required
def api_admin_delete_user():
    data    = request.get_json(force=True)
    user_id = data.get("user_id")
    if user_id == session.get("user_id"):
        return jsonify({"error": "Cannot delete your own admin account"}), 400
    db  = get_db()
    cur = db.cursor()
    try:
        # CASCADE handles Login_History, Failed_Attempts, User_Device automatically
        cur.execute("DELETE FROM Users WHERE user_id = %s", (user_id,))
        db.commit()
        return jsonify({"message": "User deleted"}), 200
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/change-role", methods=["POST"])
@admin_required
def api_admin_change_role():
    data    = request.get_json(force=True)
    user_id = data.get("user_id")
    role_id = data.get("role_id")
    if role_id not in [1, 2]:
        return jsonify({"error": "Invalid role"}), 400
    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute("UPDATE Users SET role_id = %s WHERE user_id = %s", (role_id, user_id))
        db.commit()
        return jsonify({"message": "Role updated"}), 200
    finally:
        cur.close()
        db.close()

# ── User Self-Management APIs ─────────────────────────

@app.route("/api/delete-my-account", methods=["POST"])
@login_required
def api_delete_my_account():
    data     = request.get_json(force=True)
    password = data.get("password") or ""
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("SELECT password_hash FROM Users WHERE user_id = %s", (session["user_id"],))
        user = cur.fetchone()
        if not check_password(password, user["password_hash"]):
            return jsonify({"error": "Incorrect password"}), 401
        cur.execute("DELETE FROM Users WHERE user_id = %s", (session["user_id"],))
        db.commit()
        session.clear()
        return jsonify({"message": "Account deleted"}), 200
    finally:
        cur.close()
        db.close()

@app.route("/api/request-delete-login", methods=["POST"])
@login_required
def api_request_delete_login():
    data     = request.get_json(force=True)
    login_id = data.get("login_id")
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        # Verify this login belongs to the user
        cur.execute(
            "SELECT login_id FROM Login_History WHERE login_id = %s AND user_id = %s",
            (login_id, session["user_id"])
        )
        if not cur.fetchone():
            return jsonify({"error": "Record not found"}), 404
        cur.execute(
            "INSERT INTO Deletion_Requests (user_id, login_id, status) VALUES (%s, %s, 'pending')",
            (session["user_id"], login_id)
        )
        db.commit()
        return jsonify({"message": "Deletion request submitted for admin approval"}), 200
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/approve-delete-login", methods=["POST"])
@admin_required
def api_approve_delete_login():
    data       = request.get_json(force=True)
    request_id = data.get("request_id")
    action     = data.get("action")  # 'approve' or 'reject'
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM Deletion_Requests WHERE request_id = %s", (request_id,))
        req = cur.fetchone()
        if not req:
            return jsonify({"error": "Request not found"}), 404
        if action == "approve":
            cur.execute("DELETE FROM Login_History WHERE login_id = %s", (req["login_id"],))
            cur.execute("UPDATE Deletion_Requests SET status = 'approved' WHERE request_id = %s", (request_id,))
        else:
            cur.execute("UPDATE Deletion_Requests SET status = 'rejected' WHERE request_id = %s", (request_id,))
        db.commit()
        return jsonify({"message": f"Request {action}d"}), 200
    finally:
        cur.close()
        db.close()

@app.route("/api/admin/deletion-requests")
@admin_required
def api_deletion_requests():
    db  = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT dr.request_id, dr.status, dr.requested_at,
                   u.name AS user_name, u.email,
                   lh.login_time, lh.ip_address, lh.device_info
            FROM Deletion_Requests dr
            JOIN Users u ON dr.user_id = u.user_id
            JOIN Login_History lh ON dr.login_id = lh.login_id
            WHERE dr.status = 'pending'
            ORDER BY dr.requested_at DESC
        """)
        rows = cur.fetchall()
        for row in rows:
            for key in ("requested_at", "login_time"):
                if row.get(key):
                    row[key] = str(row[key])
        return jsonify(rows)
    finally:
        cur.close()
        db.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)