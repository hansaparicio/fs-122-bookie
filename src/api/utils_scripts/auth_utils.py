from datetime import datetime, timedelta
import jwt
from flask import current_app

def create_token(user_id, expires_in_hours=5):
    """Create an access token with specified expiration time"""
    user_id_str = str(user_id) if user_id else None
    payload = {
        "sub": user_id_str,
        "type": "access",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=expires_in_hours)
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

def create_refresh_token(user_id):
    """Create a refresh token with longer expiration (7 days)"""
    user_id_str = str(user_id) if user_id else None
    payload = {
        "sub": user_id_str,
        "type": "refresh",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

def verify_token(token):
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def verify_refresh_token(token):
    """Verify a refresh token specifically"""
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        if payload.get("type") != "refresh":
            return None
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None