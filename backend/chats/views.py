from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from documents.models import Document
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer
from .agent import get_agent, clear_agent


class ChatSendView(APIView):
    """Send a message and get AI response"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        document_id = request.data.get('document_id')
        message = request.data.get('message')
        
        if not document_id or not message:
            return Response(
                {'error': 'document_id and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get document and verify ownership
        document = get_object_or_404(
            Document, 
            id=document_id, 
            user=request.user
        )
        
        if document.status != 'completed':
            return Response(
                {'error': 'Document processing not complete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not document.extracted_text:
            return Response(
                {'error': 'No text extracted from document'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create chat session
        session, created = ChatSession.objects.get_or_create(
            user=request.user,
            document=document
        )
        
        # Save user message
        ChatMessage.objects.create(
            session=session,
            role='user',
            content=message
        )
        
        # Get AI agent and response
        agent = get_agent(document.id, document.extracted_text)
        response = agent.ask(message)
        
        # Save assistant message
        ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=response['answer']
        )
        
        return Response({
            'answer': response['answer'],
            'session_id': session.id
        })


class ChatHistoryView(APIView):
    """Get chat history for a document"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, document_id):
        document = get_object_or_404(
            Document,
            id=document_id,
            user=request.user
        )
        
        session, created = ChatSession.objects.get_or_create(
            user=request.user,
            document=document
        )
        
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)


class ChatClearView(APIView):
    """Clear chat history for a document"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, document_id):
        document = get_object_or_404(
            Document,
            id=document_id,
            user=request.user
        )
        
        ChatSession.objects.filter(
            user=request.user,
            document=document
        ).delete()
        
        clear_agent(document_id)
        
        return Response({'message': 'Chat history cleared'})
