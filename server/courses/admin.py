from django.contrib import admin

from .models import Course, Exam, Question, Topic


class ExamInline(admin.TabularInline):
    model = Exam
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "share_token", "created_at")
    search_fields = ("name", "owner__email", "owner__username")
    readonly_fields = ("share_token", "created_at", "updated_at")
    inlines = [ExamInline]


class TopicInline(admin.TabularInline):
    model = Topic
    extra = 0


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "exam_size", "pass_mark")
    list_filter = ("course",)
    search_fields = ("name", "course__name")
    inlines = [TopicInline]


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "exam")
    list_filter = ("exam__course",)
    search_fields = ("name",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("code", "text", "correct", "topic", "course")
    list_filter = ("course", "topic", "correct")
    search_fields = ("code", "text")
