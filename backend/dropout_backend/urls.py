from django.contrib import admin
from django.urls import path, include
from dropout_backend.views import *

urlpatterns = [
    path('api/students/', StudentRecordView.as_view()),
    path('api/upload/', UploadCSVView.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/login/create/', CreateLogin.as_view()),
]