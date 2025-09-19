from django.contrib import admin
from dropout_backend.models import *

class StudentRecordAdmin(admin.ModelAdmin):
    list_display = (
        'st_id', 'name', 'attendance', 'avg_test_score', 
        'attempts', 'fees_paid', 'backlogs'
    )
    search_fields = ('name', 'st_id')
    list_filter = ('attendance', 'avg_test_score', 'backlogs')

admin.site.register(StudentRecord, StudentRecordAdmin)

class LoginAdmin(admin.ModelAdmin):
    list_display = ('username', 'password')
    search_fields = ('username',)

admin.site.register(Login, LoginAdmin)