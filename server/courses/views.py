"""Server-rendered views for the whole app.

Auth, landing, course management and CSV/PDF import are plain Django + HTMX.
The one rich-client screen — studying — renders its question data as embedded
JSON and hands the ephemeral study loop (MCQ / flashcards / mock exam) to a
small Alpine component (static/js/study.js). Nothing about a study session is
persisted, so anonymous share-link visitors work with zero extra plumbing.
"""

from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from . import importer
from .forms import CourseForm, ExamSettingsForm, LoginForm, SignupForm
from .models import Course, Exam

User = get_user_model()

DECK_PALETTE = [
    "#CCFF66",
    "#FFCC33",
    "#66CCFF",
    "#FF6699",
    "#FF9900",
    "#B8E986",
    "#E8B96A",
    "#E8896A",
    "#9A8CE8",
    "#6AD5E8",
    "#E86AB8",
]


# ── Landing + auth ────────────────────────────────────────────────────────
def landing(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("courses:list")
    return render(request, "landing.html")


def login_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("courses:list")
    form = LoginForm(request.POST or None)
    error = ""
    if request.method == "POST" and form.is_valid():
        email = form.cleaned_data["email"].strip().lower()
        password = form.cleaned_data["password"]
        user = authenticate(request, username=email, password=password)
        if user is None:
            match = User.objects.filter(email__iexact=email).first()
            if match is not None:
                user = authenticate(request, username=match.get_username(), password=password)
        if user is not None:
            auth_login(request, user)
            return redirect(request.GET.get("next") or "courses:list")
        error = "Invalid email or password."
    return render(request, "registration/login.html", {"form": form, "error": error})


def signup_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("courses:list")
    form = SignupForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        auth_login(request, user)
        return redirect("courses:list")
    return render(request, "registration/signup.html", {"form": form})


# ── Course management ─────────────────────────────────────────────────────
def _owned_course(request: HttpRequest, pk: int) -> Course:
    course = get_object_or_404(Course, pk=pk)
    if course.owner_id != request.user.id:
        raise Http404
    return course


@login_required
def course_list(request: HttpRequest) -> HttpResponse:
    courses = Course.objects.filter(owner=request.user).order_by("name")
    return render(request, "courses/list.html", {"courses": courses})


@login_required
def course_create(request: HttpRequest) -> HttpResponse:
    form = CourseForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        course = form.save(commit=False)
        course.owner = request.user
        course.save()
        messages.success(request, f"Created “{course.name}”. Now import some questions.")
        return redirect("courses:import", pk=course.pk)
    return render(request, "courses/form.html", {"form": form})


def _exam_summary(course: Course) -> list[dict]:
    summary = []
    for exam in course.exams.order_by("name"):
        topics = [
            {"name": t.name, "count": t.questions.count()} for t in exam.topics.order_by("name")
        ]
        summary.append(
            {
                "exam": exam,
                "topics": topics,
                "total": sum(t["count"] for t in topics),
            }
        )
    return summary


@login_required
def course_detail(request: HttpRequest, pk: int) -> HttpResponse:
    course = _owned_course(request, pk)
    share_url = request.build_absolute_uri(f"/shared/{course.share_token}/")
    return render(
        request,
        "courses/detail.html",
        {"course": course, "exams": _exam_summary(course), "share_url": share_url},
    )


@login_required
def exam_settings(request: HttpRequest, pk: int, exam_pk: int) -> HttpResponse:
    course = _owned_course(request, pk)
    exam = get_object_or_404(Exam, pk=exam_pk, course=course)
    form = ExamSettingsForm(request.POST or None, instance=exam)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, f"Updated settings for “{exam.name}”.")
        return redirect("courses:detail", pk=course.pk)
    return render(
        request, "courses/exam_settings.html", {"course": course, "exam": exam, "form": form}
    )


# ── Import (CSV upload or paste) ───────────────────────────────────────────
@login_required
def import_page(request: HttpRequest, pk: int) -> HttpResponse:
    course = _owned_course(request, pk)
    return render(request, "courses/import.html", {"course": course})


def _import_source(request: HttpRequest):
    # The import form offers two ways in — an uploaded file or pasted CSV text.
    # A file wins if both are supplied. Returns the file/str, or None if empty.
    upload = request.FILES.get("file")
    if upload:
        return upload
    pasted = (request.POST.get("pasted") or "").strip()
    return pasted or None


@login_required
def csv_preview(request: HttpRequest, pk: int) -> HttpResponse:
    course = _owned_course(request, pk)
    source = _import_source(request)
    if source is None:
        return render(
            request, "courses/_csv_preview.html", {"error": "Upload a CSV or paste one first."}
        )
    summary = importer.parse_preview(course, source)
    return render(request, "courses/_csv_preview.html", {"course": course, "summary": summary})


@login_required
def csv_commit(request: HttpRequest, pk: int) -> HttpResponse:
    course = _owned_course(request, pk)
    source = _import_source(request)
    if source is None:
        messages.error(request, "Upload a CSV or paste one first.")
        return redirect("courses:import", pk=course.pk)
    skip_invalid = request.POST.get("skip_invalid") == "on"
    try:
        result = importer.commit_import(course, source, skip_invalid=skip_invalid)
    except importer.ImportValidationError as exc:
        messages.error(
            request,
            f"Import blocked by {len(exc.errors)} error(s). Fix them or tick “skip invalid rows”.",
        )
        return redirect("courses:import", pk=course.pk)
    messages.success(
        request,
        f"Imported {result['questions_created']} new and updated "
        f"{result['questions_updated']} question(s).",
    )
    return redirect("courses:detail", pk=course.pk)


# ── Study (owner + public share link) ─────────────────────────────────────
def _study_data(course: Course) -> dict:
    """Serialize a course into the shape the Alpine study component expects."""
    exams = []
    for exam in course.exams.order_by("name"):
        topics = []
        for i, topic in enumerate(exam.topics.order_by("name")):
            questions = [
                {
                    "id": q.id,
                    "text": q.text,
                    "options": {"A": q.option_a, "B": q.option_b, "C": q.option_c, "D": q.option_d},
                    "correct": q.correct,
                    "explanation": q.explanation,
                    "source": q.source,
                }
                for q in topic.questions.all()
            ]
            topics.append(
                {
                    "name": topic.name,
                    "color": DECK_PALETTE[i % len(DECK_PALETTE)],
                    "questions": questions,
                }
            )
        exams.append(
            {
                "id": exam.id,
                "name": exam.name,
                "examSize": exam.exam_size,
                "passMarkPct": exam.pass_mark,
                "topics": topics,
            }
        )
    return {"name": course.name, "exams": exams}


@login_required
def study(request: HttpRequest, pk: int) -> HttpResponse:
    course = _owned_course(request, pk)
    share_url = request.build_absolute_uri(f"/shared/{course.share_token}/")
    return render(
        request,
        "courses/study.html",
        {
            "course": course,
            "study_data": _study_data(course),
            "shared": False,
            "share_url": share_url,
        },
    )


def shared_study(request: HttpRequest, token: str) -> HttpResponse:
    course = get_object_or_404(Course, share_token=token)
    return render(
        request,
        "courses/study.html",
        {"course": course, "study_data": _study_data(course), "shared": True, "hide_account": True},
    )
