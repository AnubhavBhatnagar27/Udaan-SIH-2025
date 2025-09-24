from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.utils.timezone import localtime
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from .models import *
from .ml_model import predict_from_model
import pandas as pd
from .email_utils import *
from rest_framework import status

from .models import StudentRecord, EmailNotification
from .email_utils import send_email

# class CreateLogin(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get("username")
#         password = request.data.get("password")
#         full_name = request.data.get("fullName")
#         employee_id = request.data.get("employeeId")
#         branch = request.data.get("branch")
#         academic_session = request.data.get("academicSession")

#         if not username or not password:
#             return Response({"error": "Please provide username and password"},
#                             status=status.HTTP_400_BAD_REQUEST)

#         if User.objects.filter(username=username).exists():
#             return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

#         user = User.objects.create_user(username=username, password=password)

#         # Create profile with additional fields
#         Profile.objects.create(
#             user=user,
#             full_name=full_name,
#             employee_id=employee_id,
#             branch=branch,
#             academic_session=academic_session
#         )

#         return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
class CreateLogin(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # === Get data from request ===
        username = request.data.get("username")
        password = request.data.get("password")
        full_name = request.data.get("fullName")
        institute = request.data.get("instituteName","Unknown Institute")  # New field
        employee_id = request.data.get("employeeId")
        branch = request.data.get("branch")
        academic_session = request.data.get("academicSession")

        # === Basic validation ===
        if not username or not password:
            return Response({"error": "Please provide username and password"},
                            status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        if Mentor.objects.filter(id_number=employee_id).exists():
            return Response({"error": "Mentor with this employee ID already exists."},
                            status=status.HTTP_400_BAD_REQUEST)

        # === Create User ===
        user = User.objects.create_user(username=username, password=password)

        # === Create Profile ===
        Profile.objects.create(
            user=user,
            full_name=full_name,
            employee_id=employee_id,
            branch=branch,
            academic_session=academic_session
        )

        # === Create Mentor ===
        Mentor.objects.create(
            user=user,
            name=full_name,
            id_number=employee_id,
            institute=institute,  # Since not collected from frontend
            branch=branch,
            session=academic_session
        )

        return Response({"message": "Mentor registered successfully."}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Please provide username and password"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

               
class SingleStudentRecordView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, st_id=None):  # accept st_id from URL kwargs
        print(f"Request user: {request.user}")
        print(f"Requested student ID: {st_id}")
        mentor_profile = request.user.profile
        try:
            student = StudentRecord.objects.get(st_id=st_id, mentor=mentor_profile)
        except StudentRecord.DoesNotExist:
            return Response({"error": "Student not found or you do not have access"}, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare your response data
        result = {
            "st_id": student.st_id,
            "name": student.name,
            "attendance": student.attendance,
            "avg_test_score": student.avg_test_score,
            "attempts": student.attempts,
            "fees_paid": student.fees_paid,
            "backlogs": student.backlogs,
            "prediction": student.prediction,
            "risk_level": student.risk_level,
            "predicted_label": student.predicted_label,
            "prediction_percentage": student.prediction_percentage,
            "guardian_name": student.guardian_name,
            "guardian_contact": student.guardian_contact,
            "branch": student.branch,
            "batch": student.batch,
            "enrolment_no": student.enrolment_no,
            "current_cgpa": student.current_cgpa,
            "img": student.img.url if student.img else None,
        }
        return Response(result, status=status.HTTP_200_OK)
    
    def patch(self, request, st_id=None):
        student = get_object_or_404(StudentRecord, st_id=st_id, mentor=request.user.profile)
        data = request.data
        # partial update: only update fields sent in request.data
        for field, value in data.items():
            if hasattr(student, field):
                setattr(student, field, value)
        student.save()
        return Response({"message": "Student record updated successfully."}, status=status.HTTP_200_OK)




# class SingleStudentRecordView(APIView):
#     def get(self, request, st_id):
#         student = get_object_or_404(StudentRecord, st_id=st_id)

#         data = {
#             "st_id": student.st_id,
#             "name": student.name,
#             "attendance": student.attendance,
#             "avg_test_score": student.avg_test_score,
#             "attempts": student.attempts,
#             "fees_paid": student.fees_paid,
#             "backlogs": student.backlogs,
#             "prediction": student.prediction,
#         }

#         return Response(data, status=status.HTTP_200_OK)

import pandas as pd
from io import StringIO

class StudentRecordView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "No mentor found for this user"}, status=404)
        except Exception as e:
            return Response({"error": f"Error fetching mentor profile: {str(e)}"}, status=500)

        try:
            students = StudentRecord.objects.filter(mentor=profile).select_related('mentor').only(
                'mentor', 'st_id', 'name', 'attendance', 'avg_test_score', 'attempts', 'fees_paid',
                'backlogs', 'prediction', 'risk_level', 'predicted_label', 'prediction_percentage',
                'guardian_name', 'guardian_contact', 'branch', 'batch', 'enrolment_no', 'current_cgpa',
                'img', 'date', 'status'
            )
        except Exception as e:
            return Response({"error": f"Error fetching students: {str(e)}"}, status=500)

        result = []
        for student in students:
            try:
                # Safely handle image URL
                img_url = None
                if student.img:
                    try:
                        img_url = student.img.url
                    except (ValueError, AttributeError):
                        img_url = None

                # Safely handle date formatting
                date_str = None
                if student.date:
                    try:
                        date_str = student.date.strftime("%d/%m/%Y")
                    except (ValueError, AttributeError):
                        date_str = None

                result.append({
                    "st_id": student.st_id,
                    "name": student.name,
                    "attendance": student.attendance,
                    "avg_test_score": student.avg_test_score,
                    "attempts": student.attempts,
                    "fees_paid": student.fees_paid,
                    "backlogs": student.backlogs,
                    "prediction": student.prediction,
                    "risk_level": student.risk_level,
                    "predicted_label": student.predicted_label,
                    "prediction_percentage": student.prediction_percentage,
                    "guardian_name": student.guardian_name,
                    "guardian_contact": student.guardian_contact,
                    "branch": student.branch,
                    "batch": student.batch,
                    "enrolment_no": student.enrolment_no,
                    "current_cgpa": student.current_cgpa,
                    "img": img_url,
                    "date": date_str,
                    "status": student.status,
                })
            except Exception as e:
                print(f"Error processing student {student.st_id}: {e}")
                # Skip this student and continue with others
                continue

        return Response(result, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "No mentor found for this user"}, status=404)

        uploaded_file = request.FILES.get('file')  # changed to 'file' to be generic
        if not uploaded_file:
            return Response({"error": "File is required"}, status=400)

        filename = uploaded_file.name.lower()
        try:
            if filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(uploaded_file)
            elif filename.endswith('.csv'):
                # decode and read csv using pandas
                decoded_file = uploaded_file.read().decode('utf-8')
                df = pd.read_csv(StringIO(decoded_file))
            else:
                return Response({"error": "Unsupported file type. Please upload CSV or Excel files."}, status=400)
        except Exception as e:
            return Response({"error": f"Failed to read file: {str(e)}"}, status=400)

        created_count = 0
        for _, row in df.iterrows():
            try:
                StudentRecord.objects.create(
                    mentor=profile,
                    st_id=int(row.get("st_id", 0)),
                    name=row.get("name", ""),
                    branch=row.get("branch", ""),
                    batch=row.get("batch", ""),
                    enrolment_no=row.get("enrolment_no", ""),
                    current_cgpa=float(row.get("current_cgpa", 0)),
                    guardian_name=row.get("guardian_name", ""),
                    guardian_contact=row.get("guardian_contact", ""),
                    attendance=float(row.get("attendance", 0)),
                    avg_test_score=float(row.get("avg_test_score", 0)),
                    attempts=int(row.get("attempts", 0)),
                    fees_paid=float(row.get("fees_paid", 0)),
                    backlogs=int(row.get("backlogs", 0)),
                    predicted_label=row.get("predicted_label", None),
                    prediction_percentage=float(row.get("prediction_percentage", 0)) if row.get("prediction_percentage") else None,
                    risk_level=row.get("risk_level", None),
                    prediction=None,
                )
                created_count += 1
            except Exception as e:
                print(f"Failed to create student record for row: {row.to_dict()}. Error: {e}")
                continue

        return Response({"message": f"Created {created_count} student records"}, status=201)


class UploadCSVView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "No mentor found for this user"}, status=404)

        filename = file_obj.name
        try:
            if filename.endswith('.xlsx') or filename.endswith('.xls'):
                df = pd.read_excel(file_obj)
            else:
                df = pd.read_csv(file_obj)
        except Exception as e:
            return Response({"error": f"Failed to read file: {str(e)}"}, status=400)

        required_columns = [
            "st_id", "name", "attendance", "avg_test_score", "attempts", "fees_paid",
            "backlogs", "Current_CGPA", "branch", "batch", "enrolment_no",
            "guardian_name", "guardian_contact"
        ]

        for col in required_columns:
            if col not in df.columns:
                return Response({"error": f"Missing column: {col}"}, status=400)

        df = df.sort_values(by='st_id')
        inserted, skipped = 0, 0

        # Clear existing records
        StudentRecord.objects.filter(mentor=profile).delete()

        for index, row in df.iterrows():
            try:
                # Check for missing or blank required values
                if any(pd.isnull(row.get(field)) or str(row.get(field)).strip() == "" for field in required_columns):
                    print(f"Skipping row {index}: missing or blank field(s)")
                    skipped += 1
                    continue

                # Convert and sanitize values
                attempts = int(row["attempts"])
                backlogs = int(row["backlogs"])
                attendance = float(row["attendance"])
                avg_test_score = float(row["avg_test_score"])
                fees_paid = float(row["fees_paid"])
                current_cgpa = float(row["Current_CGPA"])

                # Optional: strip strings
                student_data = {
                    "st_id": str(row["st_id"]).strip(),
                    "name": str(row["name"]).strip(),
                    "branch": str(row["branch"]).strip(),
                    "batch": str(row["batch"]).strip(),
                    "enrolment_no": str(row["enrolment_no"]).strip(),
                    "guardian_name": str(row["guardian_name"]).strip(),
                    "guardian_contact": str(row["guardian_contact"]).strip(),
                }

                # Predict
                prediction = predict_from_model([
                    attendance,
                    avg_test_score,
                    attempts,
                    fees_paid,
                    backlogs,
                    current_cgpa
                ])

                # Create student record
                StudentRecord.objects.create(
                    st_id=student_data["st_id"],
                    name=student_data["name"],
                    attendance=attendance,
                    avg_test_score=avg_test_score,
                    attempts=attempts,
                    fees_paid=fees_paid,
                    backlogs=backlogs,
                    current_cgpa=current_cgpa,
                    branch=student_data["branch"],
                    batch=student_data["batch"],
                    enrolment_no=student_data["enrolment_no"],
                    guardian_name=student_data["guardian_name"],
                    guardian_contact=student_data["guardian_contact"],
                    prediction=prediction,
                    mentor=profile
                )

                inserted += 1

            except Exception as e:
                print(f"Row {index} skipped (error: {str(e)})")
                skipped += 1
                continue

        return Response({
            "message": "Upload complete. Previous data cleared.",
            "inserted": inserted,
            "skipped": skipped,
        }, status=201)


        # Global exception handling (in case something goes wrong)
        # except Exception as e:
        #     return Response({'error': f'Failed to process file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





class MentorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch mentor linked to the logged-in user
        try:
            mentor = Mentor.objects.get(user=request.user)
        except Mentor.DoesNotExist:
            return Response({"error": "No mentor found for this user"}, status=404)

        data = {
            "name": mentor.name,
            "id_number": mentor.id_number,
            "institute": mentor.institute,
            "branch": mentor.branch,
            "session": mentor.session,
            "image": request.build_absolute_uri(mentor.image.url) if mentor.image else None
        }
        return Response(data)

    def post(self, request):
        data = request.data
        required_fields = ["name", "id_number", "institute", "branch", "session"]

        for field in required_fields:
            if field not in data:
                return Response({"error": f"Missing field: {field}"}, status=status.HTTP_400_BAD_REQUEST)

        if Mentor.objects.filter(id_number=data["id_number"]).exists():
            return Response({"error": "Mentor with this id_number already exists."}, status=status.HTTP_400_BAD_REQUEST)

        mentor = Mentor.objects.create(
            name=data["name"],
            id_number=data["id_number"],
            institute=data["institute"],
            branch=data["branch"],
            session=data["session"],
            image=request.FILES.get("image") if "image" in request.FILES else None
        )

        return Response({
            "message": "Mentor created successfully.",
            "mentor": {
                "name": mentor.name,
                "id_number": mentor.id_number,
                "institute": mentor.institute,
                "branch": mentor.branch,
                "session": mentor.session,
                "image": request.build_absolute_uri(mentor.image.url) if mentor.image else None
            }
        }, status=status.HTTP_201_CREATED)


# === NEW REMARKS API ===

class StudentRemarksView(APIView):
    # Optional: permission_classes = [IsAuthenticated]

    def get(self, request, st_id):
        student = get_object_or_404(StudentRecord, st_id=st_id)
        remarks = student.remarks.all().order_by('-created_at')
        data = []
        for r in remarks:
            data.append({
                "id": r.id,
                "text": r.text,
                "date": localtime(r.created_at).strftime("%d/%m/%Y, %I:%M %p"),
                "counselor": r.counselor_name,
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, st_id):
        student = get_object_or_404(StudentRecord, st_id=st_id)
        text = request.data.get("text")
        counselor = request.data.get("counselor")

        if not text or not counselor:
            return Response({"error": "Both 'text' and 'counselor' fields are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        remark = Remark.objects.create(student=student, text=text, counselor_name=counselor)
        data = {
            "id": remark.id,
            "text": remark.text,
            "date": localtime(remark.created_at).strftime("%d/%m/%Y, %I:%M %p"),
            "counselor": remark.counselor_name,
        }
        return Response(data, status=status.HTTP_201_CREATED)

# Risk Analytics API
class RiskAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "Mentor profile not found."}, status=404)

        students = StudentRecord.objects.filter(mentor=profile)

        risk_counts = {
            "High Risk": 0,
            "Medium Risk": 0,
            "Low Risk": 0
        }

        total_students = students.count()
        total_score = 0
        valid_scores = 0

        for student in students:
            prediction = student.prediction
            if not prediction:
                continue

            try:
                risk_level = prediction.get("risk_level")
                prediction_percentage = prediction.get("prediction_percentage", 0)

                if risk_level in risk_counts:
                    risk_counts[risk_level] += 1
                    total_score += prediction_percentage
                    valid_scores += 1

            except Exception:
                continue  # Skip malformed prediction

        average_score = total_score / valid_scores if valid_scores > 0 else 0

        return Response({
            "total_students": total_students,
            "average_risk_score": round(average_score, 2),
            "risk_distribution": risk_counts
        })

    

from .email_utils import send_email  # import your email helper    
from django.utils import timezone

class SendEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get("email")
        subject = request.data.get("subject")
        message = request.data.get("message")
        student_id = request.data.get("student_id")

        if not email or not subject or not message or not student_id:
            return Response(
                {"error": "Email, subject, message and student_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        success = send_email(email, subject, message)

        try:
            student = StudentRecord.objects.filter(st_id=student_id)
            student = student.first()  # Get the first matching student
        except StudentRecord.DoesNotExist:
            return Response(
                {"error": "Student not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if success:
            # Create notification log
            EmailNotification.objects.create(
                student=student,
                recipient_email=email,
                subject=subject,
                message=message,
                status="Sent",
            )

            # Update student status and date
            student.status = "Email Sent"
            student.date = timezone.now()
            student.save()

            return Response({"status": "Email sent successfully."}, status=status.HTTP_200_OK)
        else:
            # Log failure notification
            EmailNotification.objects.create(
                student=student,
                recipient_email=email,
                subject=subject,
                message=message,
                status="Failed",
            )
            return Response({"error": "Failed to send email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
