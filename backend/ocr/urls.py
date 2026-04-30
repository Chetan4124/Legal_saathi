from django.urls import path
from .views import RetryOCRView

urlpatterns = [
    path('retry/<int:pk>/', RetryOCRView.as_view(), name='ocr-retry'),
]