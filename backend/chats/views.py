from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from documents.models import Document
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer
from .agent import get_agent, clear_agent
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import io


class ExportChatView(APIView):
    """Export chat history as PDF"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, document_id, format_type='pdf'):
        document = get_object_or_404(
            Document,
            id=document_id,
            user=request.user
        )
        
        try:
            session = ChatSession.objects.get(
                user=request.user,
                document=document
            )
        except ChatSession.DoesNotExist:
            return Response(
                {'error': 'No chat history found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        messages = ChatMessage.objects.filter(session=session).order_by('created_at')
        
        if format_type == 'txt':
            return self._export_txt(document, messages)
        else:
            return self._export_pdf(document, messages)
    
    def _export_txt(self, document, messages):
        """Export as plain text"""
        content = f"Legal Saathi - Chat Export\n"
        content += f"Document: {document.title}\n"
        content += f"Date: {document.uploaded_at.strftime('%B %d, %Y')}\n"
        content += "=" * 50 + "\n\n"
        
        for msg in messages:
            role = "You" if msg.role == 'user' else "Legal Saathi AI"
            time = msg.created_at.strftime('%H:%M')
            content += f"[{time}] {role}:\n{msg.content}\n\n"
            content += "-" * 30 + "\n\n"
        
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="chat_{document.id}.txt"'
        return response
    
    def _export_pdf(self, document, messages):
        """Export as formatted PDF"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1a365d'),
            spaceAfter=20,
        )
        
        ai_style = ParagraphStyle(
            'AIMessage',
            parent=styles['Normal'],
            fontSize=10,
            leftIndent=20,
            textColor=colors.HexColor('#2d3748'),
            backColor=colors.HexColor('#ebf8ff'),
            borderPadding=8,
            borderRadius=8,
            spaceAfter=10,
        )
        
        user_style = ParagraphStyle(
            'UserMessage',
            parent=styles['Normal'],
            fontSize=10,
            rightIndent=20,
            textColor=colors.HexColor('#ffffff'),
            backColor=colors.HexColor('#2563eb'),
            borderPadding=8,
            borderRadius=8,
            spaceAfter=10,
            alignment=2,  # Right align
        )
        
        story = []
        
        # Title
        story.append(Paragraph(f"Legal Saathi - Chat Export", title_style))
        story.append(Paragraph(f"<b>Document:</b> {document.title}", styles['Normal']))
        story.append(Paragraph(f"<b>Date:</b> {document.uploaded_at.strftime('%B %d, %Y')}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Messages
        for msg in messages:
            time_str = msg.created_at.strftime('%b %d, %Y %H:%M')
            role_label = "You" if msg.role == 'user' else "Legal Saathi AI"
            content = msg.content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            content = content.replace('\n', '<br/>')
            
            if msg.role == 'user':
                story.append(Paragraph(
                    f"<font size='8' color='#94a3b8'>[{time_str}] {role_label}</font><br/>{content}",
                    user_style
                ))
            else:
                story.append(Paragraph(
                    f"<font size='8' color='#64748b'>[{time_str}] {role_label}</font><br/>{content}",
                    ai_style
                ))
        
        doc.build(story)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="chat_{document.id}.pdf"'
        return response

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
class DocumentSummaryView(APIView):
    """Generate AI summary for a document"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, document_id):
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
        
        # Use the agent to generate summary
        agent = get_agent(document.id, document.extracted_text)
        summary_prompt = (
            "Please provide a structured summary of this legal document with the following sections:\n"
            "1. Document Type: What type of legal document is this?\n"
            "2. Parties Involved: Who are the parties mentioned?\n"
            "3. Key Clauses: What are the main clauses or sections?\n"
            "4. Important Dates: Any dates, deadlines, or timelines mentioned?\n"
            "5. Key Obligations: What are the main obligations?\n"
            "6. Risks/Concerns: Any potential legal risks or concerns?\n\n"
            "Keep each section concise and clear."
        )
        
        result = agent.ask(summary_prompt)
        
        return Response({
            'summary': result['answer'],
            'success': result.get('success', True)
        })
