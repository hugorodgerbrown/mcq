from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from . import importer
from .models import Course, Exam
from .serializers import CourseContentSerializer, CourseListSerializer


def _owned_course(request: Request, pk: int) -> Course | None:
    course = get_object_or_404(Course, pk=pk)
    return course if course.owner_id == request.user.id else None


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def course_list(request: Request) -> Response:
    if request.method == "POST":
        name = (request.data.get("name") or "").strip()
        if not name:
            return Response({"errors": {"name": "Name is required"}}, status=400)
        course = Course.objects.create(
            owner=request.user,
            name=name,
            rubric=(request.data.get("rubric") or "").strip(),
        )
        return Response(CourseListSerializer(course).data, status=status.HTTP_201_CREATED)
    courses = Course.objects.filter(owner=request.user).order_by("name")
    return Response(CourseListSerializer(courses, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_content(request: Request, pk: int) -> Response:
    course = _owned_course(request, pk)
    if course is None:
        return Response(status=status.HTTP_403_FORBIDDEN)
    return Response(CourseContentSerializer(course).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def exam_update(request: Request, course_pk: int, exam_pk: int) -> Response:
    course = _owned_course(request, course_pk)
    if course is None:
        return Response(status=status.HTTP_403_FORBIDDEN)
    exam = get_object_or_404(Exam, pk=exam_pk, course=course)
    try:
        size = int(request.data.get("exam_size", exam.exam_size))
        mark = int(request.data.get("pass_mark", exam.pass_mark))
    except (TypeError, ValueError):
        return Response({"errors": {"detail": "Numbers required"}}, status=400)
    if size < 1:
        return Response({"errors": {"exam_size": "Must be at least 1"}}, status=400)
    if not (1 <= mark <= 100):
        return Response({"errors": {"pass_mark": "Must be 1–100"}}, status=400)
    exam.exam_size = size
    exam.pass_mark = mark
    exam.save(update_fields=["exam_size", "pass_mark"])
    return Response(
        {
            "id": exam.id,
            "name": exam.name,
            "exam_size": exam.exam_size,
            "pass_mark": exam.pass_mark,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_preview(request: Request, pk: int) -> Response:
    course = _owned_course(request, pk)
    if course is None:
        return Response(status=status.HTTP_403_FORBIDDEN)
    upload = request.FILES.get("file")
    if not upload:
        return Response({"errors": [{"row": 0, "message": "No file uploaded"}]}, status=400)
    return Response(importer.parse_preview(course, upload))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_commit(request: Request, pk: int) -> Response:
    course = _owned_course(request, pk)
    if course is None:
        return Response(status=status.HTTP_403_FORBIDDEN)
    upload = request.FILES.get("file")
    if not upload:
        return Response({"errors": [{"row": 0, "message": "No file uploaded"}]}, status=400)
    try:
        result = importer.commit_import(course, upload)
    except importer.ImportValidationError as exc:
        return Response(
            {"errors": [{"row": e.row, "message": e.message} for e in exc.errors]}, status=400
        )
    return Response(result)
