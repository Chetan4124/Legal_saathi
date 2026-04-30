from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Used for upload and basic operations"""
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'status', 'uploaded_at']
        read_only_fields = ['id', 'status', 'uploaded_at']


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view (no file field)"""
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'status', 'uploaded_at']


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Full serializer with extracted text for detail view"""
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'status', 'uploaded_at', 'extracted_text']
        read_only_fields = ['id', 'status', 'uploaded_at', 'extracted_text']