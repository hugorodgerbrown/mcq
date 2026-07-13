from django.urls import path

from . import views

app_name = "courses"
urlpatterns = [
    path("", views.course_list, name="list"),
    path("new/", views.course_create, name="create"),
    path("<int:pk>/", views.course_detail, name="detail"),
    path("<int:pk>/study/", views.study, name="study"),
    path("<int:pk>/settings/<int:exam_pk>/", views.exam_settings, name="exam-settings"),
    path("<int:pk>/import/", views.import_page, name="import"),
    path("<int:pk>/import/csv/preview/", views.csv_preview, name="csv-preview"),
    path("<int:pk>/import/csv/commit/", views.csv_commit, name="csv-commit"),
]
