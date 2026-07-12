from django.urls import path

from . import views

app_name = "api"
urlpatterns = [
    path("health/", views.health, name="health"),
    path("me/", views.me, name="me"),
    path("auth/signup/", views.signup, name="signup"),
    path("auth/login/", views.login, name="login"),
    path("auth/logout/", views.logout, name="logout"),
]
