from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase

from courses.models import Course, Exam, Question, Topic


class PruneEmptyTopicsCommandTests(TestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            "o", email="o@x.com", password="pw12345678"
        )
        self.course = Course.objects.create(owner=self.owner, name="C")
        self.exam = Exam.objects.create(course=self.course, name="Written")
        self.kept = Topic.objects.create(exam=self.exam, name="Law")
        self.empty_topic = Topic.objects.create(exam=self.exam, name="Ethics")
        self.empty_exam = Exam.objects.create(course=self.course, name="Oral")
        Question.objects.create(
            topic=self.kept,
            course=self.course,
            code="Q1",
            text="Q?",
            option_a="a",
            option_b="b",
            option_c="c",
            option_d="d",
            correct="A",
        )

    def test_prunes_empty_topics_and_exams(self):
        out = StringIO()
        call_command("prune_empty_topics", stdout=out)
        self.assertFalse(Topic.objects.filter(name="Ethics").exists())
        self.assertFalse(Exam.objects.filter(name="Oral").exists())
        self.assertTrue(Topic.objects.filter(name="Law").exists())
        self.assertTrue(Exam.objects.filter(name="Written").exists())

    def test_dry_run_deletes_nothing(self):
        out = StringIO()
        call_command("prune_empty_topics", "--dry-run", stdout=out)
        self.assertTrue(Topic.objects.filter(name="Ethics").exists())
        self.assertTrue(Exam.objects.filter(name="Oral").exists())
        self.assertIn("Ethics", out.getvalue())

    def test_course_filter_limits_scope(self):
        other = Course.objects.create(owner=self.owner, name="Other")
        other_empty = Topic.objects.create(
            exam=Exam.objects.create(course=other, name="X"), name="Orphan"
        )
        call_command("prune_empty_topics", "--course", str(self.course.pk))
        self.assertFalse(Topic.objects.filter(name="Ethics").exists())
        # A different course's empty topic is untouched.
        self.assertTrue(Topic.objects.filter(pk=other_empty.pk).exists())
