from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase

from courses.models import Course, Exam, Question, Topic


class DataModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user("author", password="x")
        cls.course = Course.objects.create(owner=cls.user, name="DSC1")
        cls.exam = Exam.objects.create(course=cls.course, name="Written", exam_size=50)
        cls.topic = Topic.objects.create(exam=cls.exam, name="Law")

    def _question(self, course, code, correct="A"):
        return Question.objects.create(
            topic=self.topic,
            course=course,
            code=code,
            text="Q?",
            option_a="a",
            option_b="b",
            option_c="c",
            option_d="d",
            correct=correct,
        )

    def test_reverse_accessors_resolve(self):
        self._question(self.course, "Q1")
        self.assertEqual(self.course.exams.count(), 1)
        self.assertEqual(self.exam.topics.count(), 1)
        self.assertEqual(self.topic.questions.count(), 1)
        self.assertEqual(self.course.questions.count(), 1)

    def test_code_unique_within_course(self):
        self._question(self.course, "Q1")
        with self.assertRaises(IntegrityError), transaction.atomic():
            self._question(self.course, "Q1")

    def test_same_code_allowed_across_courses(self):
        other = Course.objects.create(owner=self.user, name="Other")
        self._question(self.course, "Q1")
        # different course, same code — allowed
        self._question(other, "Q1")
        self.assertEqual(Question.objects.filter(code="Q1").count(), 2)

    def test_correct_must_be_abcd(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            self._question(self.course, "QX", correct="Z")

    def test_pass_mark_defaults_to_80(self):
        exam = Exam.objects.create(course=self.course, name="Hygiene")
        self.assertEqual(exam.pass_mark, 80)
        self.assertEqual(exam.exam_size, 50)
