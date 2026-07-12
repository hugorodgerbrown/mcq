import os
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase

User = get_user_model()


class SignupTests(TestCase):
    def test_signup_creates_user_and_logs_in(self):
        resp = self.client.post("/signup", {"email": "a@b.com", "password": "sTrongPass123"})
        self.assertRedirects(resp, "/courses/")
        self.assertTrue(User.objects.filter(email="a@b.com").exists())
        # session established → the courses page is now reachable
        self.assertEqual(self.client.get("/courses/").status_code, 200)

    def test_signup_rejects_duplicate_email_case_insensitively(self):
        User.objects.create_user(username="a@b.com", email="a@b.com", password="x12345678")
        resp = self.client.post("/signup", {"email": "A@B.com", "password": "sTrongPass123"})
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "already exists")

    def test_signup_rejects_weak_password(self):
        resp = self.client.post("/signup", {"email": "weak@b.com", "password": "123"})
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(User.objects.filter(email="weak@b.com").exists())


class LoginLogoutTests(TestCase):
    def setUp(self):
        User.objects.create_user(username="u@e.com", email="u@e.com", password="sTrongPass123")

    def test_login_page_renders(self):
        self.assertEqual(self.client.get("/login").status_code, 200)

    def test_login_succeeds_and_is_case_insensitive(self):
        resp = self.client.post("/login", {"email": "U@E.com", "password": "sTrongPass123"})
        self.assertRedirects(resp, "/courses/")

    def test_login_wrong_password(self):
        resp = self.client.post("/login", {"email": "u@e.com", "password": "nope"})
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Invalid email or password")

    def test_login_by_email_when_username_differs(self):
        User.objects.create_user(username="admin", email="admin@x.com", password="sTrongPass123")
        resp = self.client.post("/login", {"email": "admin@x.com", "password": "sTrongPass123"})
        self.assertRedirects(resp, "/courses/")

    def test_logout(self):
        self.client.login(username="u@e.com", password="sTrongPass123")
        resp = self.client.post("/logout")
        self.assertRedirects(resp, "/")
        # protected page now redirects to login
        self.assertEqual(self.client.get("/courses/").status_code, 302)


class LandingTests(TestCase):
    def test_landing_for_anonymous(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Build your own MCQ")

    def test_landing_redirects_authenticated_to_courses(self):
        User.objects.create_user(username="me@x.com", email="me@x.com", password="pw12345678")
        self.client.login(username="me@x.com", password="pw12345678")
        self.assertRedirects(self.client.get("/"), "/courses/")


class AdminSiteTests(TestCase):
    def test_admin_redirects_anonymous_to_login(self):
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
        call_command("ensure_superuser")
        self.assertEqual(User.objects.filter(username="boss@x.com").count(), 1)

    @mock.patch.dict(os.environ, {}, clear=True)
    def test_noop_without_env(self):
        call_command("ensure_superuser")
        self.assertFalse(User.objects.filter(is_superuser=True).exists())
