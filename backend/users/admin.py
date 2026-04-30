from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'is_staff', 'created_at']
    ordering = ['email']

    # Show email instead of username in admin forms
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('created_at',)}),
    )
    readonly_fields = ['created_at']

# Register your models here.
