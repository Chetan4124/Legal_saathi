from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Returns basic user info — used after login and in profile endpoint."""
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']