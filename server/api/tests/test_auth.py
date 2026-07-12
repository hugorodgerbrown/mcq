import os
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class SignupTests(APITestCase):
    def test_signup_creates_user_and_logs_in(self):
        resp = self.client.post(
            "/api/v1/auth/signup/",
            {"email": "a@b.com", "password": "sTrongPass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.json()["email"], "a@b.com")
        self.assertTrue(User.objects.filter(email="a@b.com").exists())
        # The signup response establishes a session → /me/ now returns the user.
        me = self.client.get("/api/v1/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.json()["email"], "a@b.com")

    def test_signup_rejects_duplicate_email_case_insensitively(self):
        User.objects.create_user(username="a@b.com", email="a@b.com", password="x12345678")
        resp = self.client.post(
            "/api/v1/auth/signup/",
            {"email": "A@B.com", "password": "sTrongPass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already exists", resp.json()["detail"])

    def test_signup_rejects_weak_password(self):
        resp = self.client.post(
            "/api/v1/auth/signup/",
            {"email": "weak@b.com", "password": "123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="weak@b.com").exists())

    def test_signup_rejects_invalid_email(self):
        resp = self.client.post(
            "/api/v1/auth/signup/",
            {"email": "not-an-email", "password": "sTrongPass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class LoginLogoutTests(APITestCase):
    def setUp(self):
        User.objects.create_user(username="u@e.com", email="u@e.com", password="sTrongPass123")

    def test_login_succeeds(self):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "u@e.com", "password": "sTrongPass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["email"], "u@e.com")

    def test_login_is_case_insensitive_on_email(self):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "U@E.com", "password": "sTrongPass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_login_wrong_password(self):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "u@e.com", "password": "nope"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_by_email_when_username_differs(self):
        # A superuser created with createsuperuser has username != email, but the
        # email lookup fallback still lets them sign in.
        User.objects.create_user(username="admin", email="admin@x.com", password="sTrongPass123")
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "admin@x.com", "password": "sTrongPass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_logout_clears_session(self):
        self.client.post(
            "/api/v1/auth/login/",
            {"email": "u@e.com", "password": "sTrongPass123"},
            format="json",
        )
        resp = self.client.post("/api/v1/auth/logout/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.client.get("/api/v1/me/").status_code, status.HTTP_403_FORBIDDEN)


class MeEndpointTests(APITestCase):
    def test_me_requires_auth(self):
        self.assertEqual(self.client.get("/api/v1/me/").status_code, status.HTTP_403_FORBIDDEN)

    def test_me_returns_user_when_authenticated(self):
        User.objects.create_user(username="me@x.com", email="me@x.com", password="pw12345678")
        self.client.force_login(User.objects.get(username="me@x.com"))
        resp = self.client.get("/api/v1/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["email"], "me@x.com")


class AdminSiteTests(TestCase):
    def test_admin_redirects_anonymous_to_login(self):
        # Confirms the admin is wired up (django.contrib.admin + /admin/ URL).
        # An anonymous GET redirects to the admin login — without rendering the
        # login template, which would need collected static files.
        resp = self.client.get("/admin/")
        self.assertEqual(resp.status_code, 302)
        self.assertIn("/admin/login/", resp["Location"])


class EnsureSuperuserTests(TestCase):
    @mock.patch.dict(
        os.environ,
        {"DJANGO_SUPERUSER_EMAIL": "boss@x.com", "DJANGO_SUPERUSER_PASSWORD": "sTrongPass123"},
    )
    def test_creates_and_is_idempotent(self):
        call_command("ensure_superuser")
        user = User.objects.get(username="boss@x.com")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        # A second run updates in place rather than erroring or duplicating.
        call_command("ensure_superuser")
        self.assertEqual(User.objects.filter(username="boss@x.com").count(), 1)

    @mock.patch.dict(os.environ, {}, clear=True)
    def test_noop_without_env(self):
        call_command("ensure_superuser")
        self.assertFalse(User.objects.filter(is_superuser=True).exists())
