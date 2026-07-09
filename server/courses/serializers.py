from rest_framework import serializers

from .models import Course, Exam, Question, Topic


class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "rubric"]


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "code", "text", "options", "correct", "explanation", "source"]

    def get_options(self, obj: Question) -> dict:
        return {"A": obj.option_a, "B": obj.option_b, "C": obj.option_c, "D": obj.option_d}


class TopicSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = ["id", "name", "questions"]


class ExamSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = ["id", "name", "exam_size", "pass_mark", "topics"]


class CourseContentSerializer(serializers.ModelSerializer):
    exams = ExamSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ["id", "name", "exams"]
