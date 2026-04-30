from django.db import models
from django.contrib.auth import get_user_model
from documents.models import Document

User = get_user_model()


class ChatSession(models.Model):
    """Represents a chat session for a document"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chat_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'document']
    
    def __str__(self):
        return f"Chat: {self.document.title} - {self.user.email}"


class ChatMessage(models.Model):
    """Individual messages in a chat session"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."

# Create your models here.
