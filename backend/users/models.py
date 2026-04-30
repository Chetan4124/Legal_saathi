from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — extends Django's default user.
    We add an email as the login field instead of username.
    """
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'             # Login with email
    REQUIRED_FIELDS = ['username']       # Required when creating superuser

    def __str__(self):
        return self.email

# Create your models here.
