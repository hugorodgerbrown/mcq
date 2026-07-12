from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response


def _user_payload(user) -> dict:
    return {"id": user.pk, "email": user.email}


@api_view(["GET"])
def health(_request: Request) -> Response:
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request: Request) -> Response:
    return Response(_user_payload(request.user))


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request: Request) -> Response:
    """Create an account (email + password) and log the user straight in.

    The default User model is username-based, so we store the email as both the
    username and the email. No email verification — accounts are usable at once.
    """
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    try:
        validate_email(email)
    except ValidationError:
        return Response(
            {"detail": "Enter a valid email address."}, status=status.HTTP_400_BAD_REQUEST
        )
    if User.objects.filter(username__iexact=email).exists() or (
        User.objects.filter(email__iexact=email).exists()
    ):
        return Response(
            {"detail": "An account with this email already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        validate_password(password)
    except ValidationError as exc:
        return Response({"detail": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=email, email=email, password=password)
    auth_login(request, user)
    return Response(_user_payload(user), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request: Request) -> Response:
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    # Users are created with username == email, but fall back to an email lookup
    # so accounts made another way (e.g. createsuperuser) can still sign in.
    user = authenticate(request, username=email, password=password)
    if user is None:
        match = User.objects.filter(email__iexact=email).first()
        if match is not None:
            user = authenticate(request, username=match.get_username(), password=password)
    if user is None:
        return Response(
            {"detail": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST
        )
    auth_login(request, user)
    return Response(_user_payload(user))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request: Request) -> Response:
    auth_logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)
