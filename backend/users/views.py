from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserProfileSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Public endpoint — no login required to register.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Returns access + refresh JWT tokens.
    Send: { "email": "...", "password": "..." }
    Built into SimpleJWT — no extra code needed.
    """
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/   → get logged in user's info
    PUT  /api/auth/profile/   → update username
    Requires: Bearer token in Authorization header.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user   # Always returns the logged in user

# Create your views here.
