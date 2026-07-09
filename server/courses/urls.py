from django.urls import path

from . import api_views

app_name = "courses"
urlpatterns = [
    path("<int:pk>/import/preview/", api_views.import_preview, name="import-preview"),
    path("<int:pk>/import/commit/", api_views.import_commit, name="import-commit"),
]
