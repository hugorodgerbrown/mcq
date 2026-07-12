from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Course, Exam


class SignupForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={"autocomplete": "email"}))
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        help_text="At least 8 characters.",
    )

    def clean_email(self) -> str:
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(username__iexact=email).exists() or (
            User.objects.filter(email__iexact=email).exists()
        ):
            raise ValidationError("An account with this email already exists.")
        return email

    def clean_password(self) -> str:
        password = self.cleaned_data["password"]
        validate_password(password)
        return password

    def save(self) -> User:
        email = self.cleaned_data["email"]
        return User.objects.create_user(
            username=email, email=email, password=self.cleaned_data["password"]
        )


class LoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={"autocomplete": "email"}))
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "current-password"})
    )


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ["name", "rubric"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "e.g. DSC1 Meat Hygiene"}),
            "rubric": forms.Textarea(
                attrs={"rows": 4, "placeholder": "Notes about scope or marking"}
            ),
        }


class ExamSettingsForm(forms.ModelForm):
    class Meta:
        model = Exam
        fields = ["exam_size", "pass_mark"]

    def clean_exam_size(self) -> int:
        size = self.cleaned_data["exam_size"]
        if size < 1:
            raise ValidationError("Must be at least 1.")
        return size

    def clean_pass_mark(self) -> int:
        mark = self.cleaned_data["pass_mark"]
        if not (1 <= mark <= 100):
            raise ValidationError("Must be between 1 and 100.")
        return mark


class UploadForm(forms.Form):
    file = forms.FileField()
