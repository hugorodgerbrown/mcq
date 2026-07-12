"""Root-level routes (landing, auth, public share link).

Kept in the courses app and included by string from config.urls so config does
not import view code directly — matching the project's mypy scope (config + api).
"""

from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views

urlpatterns = [
    path("", views.landing, name="landing"),
    path("login", views.login_view, name="login"),
    path("signup", views.signup_view, name="signup"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("shared/<uuid:token>/", views.shared_study, name="shared"),
]
