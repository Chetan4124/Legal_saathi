from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.ChatSendView.as_view(), name='chat-send'),
    path('history/<int:document_id>/', views.ChatHistoryView.as_view(), name='chat-history'),
    path('clear/<int:document_id>/', views.ChatClearView.as_view(), name='chat-clear'),
]