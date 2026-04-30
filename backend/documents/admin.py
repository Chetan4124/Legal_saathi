from django.contrib import admin
from .models import Document
 
 
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ['title', 'user', 'file_type', 'status', 'uploaded_at']
    list_filter   = ['status', 'file_type']
    search_fields = ['title', 'user__email']
    readonly_fields = ['extracted_text', 'uploaded_at', 'updated_at']