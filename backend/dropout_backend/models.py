from django.db import models

# Create your models here.
class StudentRecord(models.Model):
    st_id = models.IntegerField(null=True, default=0)
    name = models.CharField(max_length=100)
    attendance = models.FloatField()
    avg_test_score = models.FloatField()
    attempts=models.IntegerField(null=True, default=0)
    fees_paid = models.FloatField()
    backlogs = models.IntegerField(null=True, default=0)
    prediction = models.CharField(max_length=100, null=True, blank=True)


    def __str__(self):
        return f"{self.st_id} - {self.name} - {self.attendance} - {self.avg_test_score} - {self.attempts} - {self.fees_paid} - {self.backlogs}"
    

class Login(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username
    
