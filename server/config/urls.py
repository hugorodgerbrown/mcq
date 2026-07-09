from django.conf import settings
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def spa_index(request: object) -> HttpResponse:
    index = settings.BASE_DIR / "spa_dist" / "index.html"
    if not index.exists():
        return HttpResponse("SPA not built. Run `npm run build`.", content_type="text/plain")
    return HttpResponse(index.read_text(), content_type="text/html")


urlpatterns = [
    path("api/v1/", include("api.urls")),
    path("api/v1/courses/", include("courses.urls")),
    path("accounts/", include("allauth.urls")),
    path("", spa_index),
    re_path(r"^(?!api/|accounts/|static/).*$", spa_index),
]
