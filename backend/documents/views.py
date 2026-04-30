from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .serializers import DocumentSerializer, DocumentListSerializer
from ocr.services import extract_text


class DocumentUploadView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        # Save document first
        document = serializer.save(user=self.request.user, status='processing')
        
        try:
            # Extract text using the file path
            extracted_text = extract_text(document.file.path)
            document.extracted_text = extracted_text
            document.status = 'completed'
        except Exception as e:
            document.status = 'failed'
            print(f"OCR Error: {e}")
        
        document.save()


class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-uploaded_at')


class DocumentDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            from .serializers import DocumentDetailSerializer
            return DocumentDetailSerializer
        return DocumentSerializer
# Create your views here.
