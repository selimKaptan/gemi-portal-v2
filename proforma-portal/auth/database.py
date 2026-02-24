"""
SQLite tabanlı kullanıcı veritabanı - kayıt ve giriş
"""
import sqlite3
import os
import bcrypt
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "users.db"


def get_connection():
    """Veritabanı bağlantısı"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(str(DB_PATH))


def init_db():
    """users tablosunu oluştur"""
    conn = get_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                company_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    finally:
        conn.close()


def register_user(email: str, password: str, full_name: str, company_name: str = "") -> tuple[bool, str]:
    """
    Yeni kullanıcı kaydı. (success, message) döner.
    """
    if not email or not password or not full_name:
        return False, "Email, şifre ve isim zorunludur."

    if len(password) < 6:
        return False, "Şifre en az 6 karakter olmalıdır."

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (email, password_hash, full_name, company_name) VALUES (?, ?, ?, ?)",
            (email.strip().lower(), password_hash, full_name.strip(), (company_name or "").strip()),
        )
        conn.commit()
        return True, "Kayıt başarılı. Giriş yapabilirsiniz."
    except sqlite3.IntegrityError:
        return False, "Bu email adresi zaten kayıtlı."
    except Exception as e:
        return False, f"Hata: {str(e)}"
    finally:
        conn.close()


def login_user(email: str, password: str) -> tuple:
    """
    Giriş doğrulama. (success, user_dict, message) döner.
    user_dict: {id, email, full_name, company_name}
    """
    if not email or not password:
        return False, None, "Email ve şifre girin."

    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, email, password_hash, full_name, company_name FROM users WHERE email = ?",
            (email.strip().lower(),),
        ).fetchone()

        if not row:
            return False, None, "Geçersiz email veya şifre."

        _id, db_email, password_hash, full_name, company_name = row

        if not bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8")):
            return False, None, "Geçersiz email veya şifre."

        return True, {
            "id": _id,
            "email": db_email,
            "full_name": full_name,
            "company_name": company_name or "",
        }, "Giriş başarılı."
    finally:
        conn.close()


# Uygulama başlangıcında DB'yi hazırla
init_db()
