from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=50)
    branch = models.CharField(max_length=100)
    academic_session = models.CharField(max_length=50)

class StudentRecord(models.Model):
    st_id = models.IntegerField(null=True, default=0)
    name = models.CharField(max_length=100)
    attendance = models.FloatField()
    avg_test_score = models.FloatField()
    attempts = models.IntegerField(null=True, default=0)
    fees_paid = models.FloatField()
    backlogs = models.IntegerField(null=True, default=0)

    # ✅ New prediction-related fields
    predicted_label = models.CharField(max_length=10, null=True, blank=True)
    prediction_percentage = models.FloatField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, null=True, blank=True)

    # Remove or deprecate this if no longer needed
    prediction = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.st_id} - {self.name}"


class Mentor(models.Model):
    name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20, unique=True)
    institute = models.CharField(max_length=150)
    branch = models.CharField(max_length=100)
    session = models.CharField(max_length=20)
    image = models.ImageField(upload_to='mentors/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.id_number} - {self.institute} - {self.branch} - {self.session}"
    

class Remark(models.Model):
    student = models.ForeignKey(StudentRecord,related_name='remarks', on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    counselor_name = models.CharField(max_length=100)
    def __str__(self):
        return f"Remark for {self.student.name} at {self.created_at}"