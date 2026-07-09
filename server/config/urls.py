from django.urls import include, path

urlpatterns = [
    path("api/v1/", include("api.urls")),
    path("api/v1/courses/", include("courses.urls")),
    path("accounts/", include("allauth.urls")),
]
