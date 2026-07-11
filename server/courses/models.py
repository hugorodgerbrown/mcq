import uuid

from django.conf import settings
from django.db import models


class Course(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="courses"
    )
    name = models.CharField(max_length=200)
    rubric = models.TextField(blank=True)
    # Stable, unguessable token for the public share link. Fixed for the life of
    # the course so a shared URL never changes.
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Exam(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="exams")
    name = models.CharField(max_length=200)
    exam_size = models.PositiveIntegerField(default=50)
    pass_mark = models.PositiveIntegerField(default=80)  # percentage, 0–100

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(pass_mark__lte=100), name="pass_mark_pct_max_100"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.course.name} · {self.name}"


class Topic(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="topics")
    name = models.CharField(max_length=200)

    def __str__(self) -> str:
        return self.name


class Question(models.Model):
    class Correct(models.TextChoices):
        A = "A", "A"
        B = "B", "B"
        C = "C", "C"
        D = "D", "D"

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="questions")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="questions")
    code = models.CharField(max_length=50)
    text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct = models.CharField(max_length=1, choices=Correct.choices)
    explanation = models.TextField(blank=True)
    source = models.CharField(max_length=300, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["course", "code"], name="unique_course_code"),
            models.CheckConstraint(
                check=models.Q(correct__in=["A", "B", "C", "D"]), name="correct_in_abcd"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.code}: {self.text[:50]}"
