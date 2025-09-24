from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=50)
    branch = models.CharField(max_length=100)
    academic_session = models.CharField(max_length=50)

class StudentRecord(models.Model):
    mentor=models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='students', null=True, blank=True, db_index=True)
    st_id = models.IntegerField(null=True, default=0, db_index=True)
    name = models.CharField(max_length=100)
    branch = models.CharField(max_length=100)
    batch = models.CharField(max_length=50,default="",blank=True)
    enrolment_no = models.CharField(max_length=50, unique=True, default="", blank=True)
    current_cgpa = models.FloatField(null=True, default=0.0)
    guardian_name = models.CharField(max_length=100, default="", null=True, blank=True)
    guardian_contact = models.EmailField(max_length=254, default="",null=True, blank=True)
    attendance = models.FloatField()
    avg_test_score = models.FloatField()
    attempts = models.IntegerField(null=True, default=0)
    fees_paid = models.FloatField()
    backlogs = models.IntegerField(null=True, default=0)
    img=models.ImageField(upload_to='student_images/', null=True, blank=True)

    # ✅ New prediction-related fields
    predicted_label = models.CharField(max_length=10, null=True, blank=True)
    prediction_percentage = models.FloatField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, null=True, blank=True)

    # Remove or deprecate this if no longer needed
    prediction = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, default="Unknown")  # e.g., "At Risk", "Safe", etc.
    date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.st_id} - {self.name}"


# class Mentor(models.Model):
#     name = models.CharField(max_length=100)
#     id_number = models.CharField(max_length=20, unique=True)
#     institute = models.CharField(max_length=150)
#     branch = models.CharField(max_length=100)
#     session = models.CharField(max_length=20)
#     image = models.ImageField(upload_to='mentors/', null=True, blank=True)

#     def __str__(self):
#         return f"{self.name} - {self.id_number} - {self.institute} - {self.branch} - {self.session}"
    
from django.contrib.auth.models import User

class Mentor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20, unique=True)
    institute = models.CharField(max_length=150)
    branch = models.CharField(max_length=100)
    session = models.CharField(max_length=20)
    image = models.ImageField(upload_to='mentors/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.id_number}"

class Remark(models.Model):
    student = models.ForeignKey(StudentRecord,related_name='remarks', on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    counselor_name = models.CharField(max_length=100)
    def __str__(self):
        return f"Remark for {self.student.name} at {self.created_at}"
    
# class SMSNotification(models.Model):
#     recipient_number = models.CharField(max_length=15)
#     message = models.TextField()
#     status = models.CharField(max_length=20)  # success / failed
#     sent_at = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"{self.student.name} - {self.status} @ {self.sent_at.strftime('%d-%m-%Y %I:%M %p')}"

class EmailNotification(models.Model):
    student = models.ForeignKey(StudentRecord, related_name='email_notifications', on_delete=models.CASCADE)
    recipient_email = models.EmailField(max_length=254)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, default="Sent")  # e.g., Sent, Failed
    sent_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Email to {self.student.name} ({self.recipient_email}) at {self.sent_at.strftime('%d-%m-%Y %I:%M %p')}"