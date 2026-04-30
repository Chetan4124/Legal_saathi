from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from documents.models import Document
from .services import extract_text


class RetryOCRView(APIView):
    """
    POST /api/ocr/retry/<document_id>/
    Manually retry OCR on a document that failed.
    Useful if OCR failed due to a temporary error.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            # Make sure the document belongs to the logged in user
            document = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if document.status == 'processing':
            return Response(
                {'error': 'Document is already being processed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Re-run OCR
        extract_text(document)

        return Response(
            {'message': 'OCR completed successfully.', 'status': document.status},
            status=status.HTTP_200_OK
        )