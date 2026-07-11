from django.urls import path

from . import api_views

app_name = "courses"
urlpatterns = [
    path("", api_views.course_list, name="list"),
    path("shared/<uuid:token>/", api_views.shared_course_content, name="shared"),
    path("<int:pk>/content/", api_views.course_content, name="content"),
    path("<int:pk>/import/preview/", api_views.import_preview, name="import-preview"),
    path("<int:pk>/import/commit/", api_views.import_commit, name="import-commit"),
    path("<int:pk>/import/pdf/", api_views.pdf_import_start, name="pdf-import-start"),
    path(
        "<int:pk>/import/pdf/<int:job_pk>/",
        api_views.pdf_import_job,
        name="pdf-import-job",
    ),
    path(
        "<int:pk>/import/pdf/<int:job_pk>/commit/",
        api_views.pdf_import_commit,
        name="pdf-import-commit",
    ),
    path(
        "<int:course_pk>/exams/<int:exam_pk>/",
        api_views.exam_update,
        name="exam-update",
    ),
]
