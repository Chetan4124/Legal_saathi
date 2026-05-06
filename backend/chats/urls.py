from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.ChatSendView.as_view(), name='chat-send'),
    path('history/<int:document_id>/', views.ChatHistoryView.as_view(), name='chat-history'),
    path('clear/<int:document_id>/', views.ChatClearView.as_view(), name='chat-clear'),
    path('summary/<int:document_id>/', views.DocumentSummaryView.as_view(), name='document-summary'),
    path('export/<int:document_id>/<str:format_type>/', views.ExportChatView.as_view(), name='chat-export'),
]