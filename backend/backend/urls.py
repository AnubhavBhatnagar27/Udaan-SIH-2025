
from django.contrib import admin
from django.urls import path, include
from dropout_backend import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('dropout_backend.urls')),
    # path('upload/',views.upload_file, name='upload_file'),
]
