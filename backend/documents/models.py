from django.db import models
from django.conf import settings
 
 
class Document(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),      # Just uploaded, OCR not started
        ('processing', 'Processing'),   # OCR running
        ('completed',  'Completed'),    # OCR done, ready for AI chat
        ('failed',     'Failed'),       # OCR failed
    ]
 
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    title        = models.CharField(max_length=255)
    file         = models.FileField(upload_to='documents/%Y/%m/%d/')  # Saves to media/documents/year/month/day/
    file_type    = models.CharField(max_length=10)   # 'pdf', 'png', 'jpg'
    extracted_text = models.TextField(blank=True)    # OCR output stored here
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    uploaded_at  = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
 
    class Meta:
        ordering = ['-uploaded_at']   # Newest first
 
    def __str__(self):
        return f"{self.title} ({self.user.email})"