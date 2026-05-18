"""
Collabify – Backend Integration Test Suite
==========================================
Tests the FastAPI endpoints using httpx's ASGI transport so no server needs
to be running.  Each test is designed to be independent; a unique random
email is used wherever a user account is required so tests can be run
repeatedly against the same database without collisions.
"""

import random
import string
import sys
import os

import pytest

# Allow imports from the backend package root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from main import collabify                 # noqa: E402


client = TestClient(collabify)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _random_email() -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"testuser_{suffix}@example.com"


def _register_and_login(email: str, password: str = "SecurePass123!") -> str:
    """Register a new account and return the access token."""
    resp = client.post("/signup/", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Signup failed: {resp.text}"
    return resp.json()["access_token"]


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ─────────────────────────────────────────────────────────────────────────────
# 1. Public endpoints
# ─────────────────────────────────────────────────────────────────────────────

class TestPublicEndpoints:

    def test_root_returns_200(self):
        """GET / should return 200 and mention Collabify."""
        resp = client.get("/")
        assert resp.status_code == 200
        body = resp.json()
        assert "Collabify" in str(body)

    def test_root_response_structure(self):
        """Root endpoint response should be a JSON object."""
        resp = client.get("/")
        assert isinstance(resp.json(), dict)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Authentication
# ─────────────────────────────────────────────────────────────────────────────

class TestAuthentication:

    def test_signup_creates_account(self):
        """POST /signup/ with valid credentials returns an access token."""
        email = _random_email()
        resp = client.post("/signup/", json={"email": email, "password": "Pass123!"})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_signup_duplicate_email_rejected(self):
        """Registering the same email twice should return 400."""
        email = _random_email()
        client.post("/signup/", json={"email": email, "password": "Pass123!"})
        resp = client.post("/signup/", json={"email": email, "password": "Pass123!"})
        assert resp.status_code == 400

    def test_login_valid_credentials(self):
        """POST /token with correct credentials returns a token."""
        email = _random_email()
        password = "LoginPass456!"
        client.post("/signup/", json={"email": email, "password": password})

        resp = client.post(
            "/token",
            data={"username": email, "password": password, "grant_type": "password"},
            headers={"content-type": "application/x-www-form-urlencoded"},
        )
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self):
        """POST /token with wrong password returns 401."""
        email = _random_email()
        client.post("/signup/", json={"email": email, "password": "CorrectPass!"})

        resp = client.post(
            "/token",
            data={"username": email, "password": "WrongPass!", "grant_type": "password"},
            headers={"content-type": "application/x-www-form-urlencoded"},
        )
        # Backend returns 401 for wrong password when user exists
        assert resp.status_code in (400, 401)

    def test_protected_route_with_valid_token(self):
        """GET /protected_route with a valid Bearer token returns 200."""
        token = _register_and_login(_random_email())
        resp = client.get("/protected_route", headers=_auth_headers(token))
        assert resp.status_code == 200

    def test_protected_route_without_token_returns_401(self):
        """GET /protected_route without a token should be rejected."""
        resp = client.get("/protected_route")
        assert resp.status_code == 401

    def test_logout(self):
        """GET /logout with valid token returns 200."""
        token = _register_and_login(_random_email())
        resp = client.get("/logout", headers=_auth_headers(token))
        assert resp.status_code == 200


# ─────────────────────────────────────────────────────────────────────────────
# 3. Todo CRUD
# ─────────────────────────────────────────────────────────────────────────────

class TestTodoCRUD:

    @pytest.fixture
    def auth(self):
        token = _register_and_login(_random_email())
        return _auth_headers(token)

    def test_get_todos_empty_initially(self, auth):
        """A new user should have no todos."""
        resp = client.get("/get-todo/", headers=auth)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_add_todo(self, auth):
        """POST /add-todo/ creates a todo and returns it."""
        payload = {"title": "Test Project", "name": "Write tests", "duedate": "2025-12-31"}
        resp = client.post("/add-todo/", json=payload, headers=auth)
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Test Project"
        assert data["name"] == "Write tests"

    def test_get_todos_after_add(self, auth):
        """After adding a todo, the list should contain it."""
        client.post(
            "/add-todo/",
            json={"title": "My Task", "name": "Subtask", "duedate": "2025-06-01"},
            headers=auth,
        )
        resp = client.get("/get-todo/", headers=auth)
        assert resp.status_code == 200
        todos = resp.json()
        assert len(todos) >= 1
        titles = [t["title"] for t in todos]
        assert "My Task" in titles

    def test_todo_requires_auth(self):
        """GET /get-todo/ without a token returns 401."""
        resp = client.get("/get-todo/")
        assert resp.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# 4. Notes CRUD
# ─────────────────────────────────────────────────────────────────────────────

class TestNotesCRUD:

    @pytest.fixture
    def auth(self):
        token = _register_and_login(_random_email())
        return _auth_headers(token)

    def test_get_notes_empty_initially(self, auth):
        resp = client.get("/get-notes/", headers=auth)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_add_note(self, auth):
        payload = {"title": "Sprint Notes", "body": "Discussed backlog items.", "time": "2025-05-18"}
        resp = client.post("/add-notes/", json=payload, headers=auth)
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Sprint Notes"

    def test_get_notes_after_add(self, auth):
        client.post(
            "/add-notes/",
            json={"title": "Meeting Notes", "body": "Team standup.", "time": "2025-05-18"},
            headers=auth,
        )
        resp = client.get("/get-notes/", headers=auth)
        assert resp.status_code == 200
        notes = resp.json()
        assert any(n["title"] == "Meeting Notes" for n in notes)

    def test_notes_require_auth(self):
        resp = client.get("/get-notes/")
        assert resp.status_code == 401
