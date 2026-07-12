"""Create or update the admin superuser from environment variables.

Unlike `createsuperuser --noinput`, this is idempotent: it can run on every
deploy. If DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD are set it creates
the account (or resets its password and re-grants staff/superuser), so the
Django admin at /admin/ is always reachable. With the vars unset it does
nothing, so local/dev runs are unaffected.
"""

import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Ensure a superuser exists, from DJANGO_SUPERUSER_EMAIL/PASSWORD."

    def handle(self, *args, **options) -> None:
        email = (os.environ.get("DJANGO_SUPERUSER_EMAIL") or "").strip().lower()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD") or ""
        if not email or not password:
            self.stdout.write(
                "DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD not set — "
                "skipping superuser creation."
            )
            return

        user, created = User.objects.get_or_create(username=email, defaults={"email": email})
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        verb = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{verb} superuser {email}."))
