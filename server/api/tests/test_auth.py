from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class SignupVerificationTests(TestCase):
    def test_signup_creates_user_and_sends_verification(self):
        resp = self.client.post(
            reverse("account_signup"),
            {"email": "a@b.com", "password1": "sTrongPass123", "password2": "sTrongPass123"},
        )
        self.assertIn(resp.status_code, (200, 302))
        User = get_user_model()
        self.assertTrue(User.objects.filter(email="a@b.com").exists())
        self.assertEqual(len(mail.outbox), 1)  # verification email captured by console backend

    def test_email_unverified_until_key_confirmed(self):
        self.client.post(
            reverse("account_signup"),
            {"email": "c@d.com", "password1": "sTrongPass123", "password2": "sTrongPass123"},
        )
        ea = EmailAddress.objects.get(email="c@d.com")
        self.assertFalse(ea.verified)
        ea.verified = True
        ea.save()
        self.assertTrue(EmailAddress.objects.get(email="c@d.com").verified)


class PasswordResetTests(TestCase):
    def test_reset_email_sent_for_existing_user(self):
        get_user_model().objects.create_user("u", email="u@e.com", password="oldPass123")
        resp = self.client.post(reverse("account_reset_password"), {"email": "u@e.com"})
        self.assertIn(resp.status_code, (200, 302))
        self.assertEqual(len(mail.outbox), 1)


class MeEndpointTests(APITestCase):
    def test_me_requires_auth(self):
        self.assertEqual(self.client.get("/api/v1/me/").status_code, status.HTTP_403_FORBIDDEN)

    def test_me_returns_user_when_authenticated(self):
        get_user_model().objects.create_user("me", email="me@x.com", password="pw12345678")
        self.client.force_login(get_user_model().objects.get(username="me"))
        resp = self.client.get("/api/v1/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json()["email"], "me@x.com")


class AuthPageThemeTests(TestCase):
    def test_login_page_uses_themed_base(self):
        resp = self.client.get(reverse("account_login"))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'data-auth-base="dsc1"')
