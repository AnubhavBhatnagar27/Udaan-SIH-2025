from django.contrib import admin
from django.urls import path, include
from dropout_backend.views import *
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path('api/login/create/', CreateLogin.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/students/', StudentRecordView.as_view()),
    path('api/students/<int:st_id>/', SingleStudentRecordView.as_view()),
    path('api/students/<int:st_id>/remarks/', StudentRemarksView.as_view()),
    path('api/risk-analytics/', RiskAnalyticsView.as_view()),
    path('api/mentors/', MentorView.as_view()),
    path('api/upload/', UploadCSVView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/send-email/', SendEmailView.as_view(), name='send-email'),
]