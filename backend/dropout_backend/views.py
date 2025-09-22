from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.utils.timezone import localtime
from rest_framework.parsers import MultiPartParser, FormParser

from .models import *
from .ml_model import predict_from_model
import pandas as pd

class CreateLogin(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        full_name = request.data.get("fullName")
        employee_id = request.data.get("employeeId")
        branch = request.data.get("branch")
        academic_session = request.data.get("academicSession")

        if not username or not password:
            return Response({"error": "Please provide username and password"},
                            status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)

        # Create profile with additional fields
        Profile.objects.create(
            user=user,
            full_name=full_name,
            employee_id=employee_id,
            branch=branch,
            academic_session=academic_session
        )

        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Please provide username and password"},
                            status=status.HTTP_400_BAD_REQUEST)

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
    def get(self, request, st_id):
        student = get_object_or_404(StudentRecord, st_id=st_id)

        data = {
            "st_id": student.st_id,
            "name": student.name,
            "attendance": student.attendance,
            "avg_test_score": student.avg_test_score,
            "attempts": student.attempts,
            "fees_paid": student.fees_paid,
            "backlogs": student.backlogs,
            "prediction": student.prediction,
        }

        return Response(data, status=status.HTTP_200_OK)


class StudentRecordView(APIView):
    # You can add JWT auth here if you want by adding permission_classes

    def get(self, request):
        students = StudentRecord.objects.all()
        result = []
        for student in students:
            result.append({
                "st_id": student.st_id,
                "name": student.name,
                "attendance": student.attendance,
                "avg_test_score": student.avg_test_score,
                "attempts": student.attempts,
                "fees_paid": student.fees_paid,
                "backlogs": student.backlogs,
                "prediction": student.prediction,
            })
        return Response(result)

    def post(self, request):
        data = request.data
        required_fields = ["st_id", "name", "attendance", "avg_test_score", "fees_paid"]

        for field in required_fields:
            if field not in data:
                return Response({"error": f"Missing field: {field}"}, status=status.HTTP_400_BAD_REQUEST)

        if StudentRecord.objects.filter(st_id=data["st_id"]).exists():
            return Response({"error": "Student with this st_id already exists."}, status=status.HTTP_400_BAD_REQUEST)

        attempts = data.get("attempts", 0)
        backlogs = data.get("backlogs", 0)

        try:
            input_data = [
                float(data["attendance"]),
                float(data["avg_test_score"]),
                int(attempts),
                float(data["fees_paid"]),
                int(backlogs),
            ]
            prediction = predict_from_model(input_data)
        except Exception as e:
            return Response({"error": f"Prediction failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        StudentRecord.objects.create(
            st_id=data["st_id"],
            name=data["name"],
            attendance=data["attendance"],
            avg_test_score=data["avg_test_score"],
            attempts=attempts,
            fees_paid=data["fees_paid"],
            backlogs=backlogs,
            prediction=prediction,
        )

        return Response({
            "message": "Student created successfully.",
            "prediction": prediction
        }, status=status.HTTP_201_CREATED)


class UploadCSVView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            filename=file_obj.name
            if not (filename.endswith('.xlsx') or filename.endswith('.xls')):
                df = pd.read_csv(file_obj)
            else:
                df = pd.read_excel(file_obj)

            required_columns = ["st_id", "name", "attendance", "avg_test_score", 'attempts', "fees_paid","backlog","Current_CGPA"]
            for col in required_columns:
                if col not in df.columns:
                    return Response({"error": f"Missing column: {col}"}, status=status.HTTP_400_BAD_REQUEST)

            df=df.sort_values(by='st_id')
            inserted = 0
            skipped = 0
            for _, row in df.iterrows():
                if StudentRecord.objects.filter(st_id=row['st_id']).exists():
                    skipped += 1
                    continue

                attempts = int(row.get("attempts", 0))
                backlogs = int(row.get("backlogs", 0))

                input_data = [
                    float(row["attendance"]),
                    float(row["avg_test_score"]),
                    attempts,
                    float(row["fees_paid"]),
                    backlogs,
                    float(row["Current_CGPA"]),
                ]

                try:
                    prediction = predict_from_model(input_data)
                except Exception as e:
                    return Response({"error": f"Prediction failed on row with st_id {row['st_id']}: {str(e)}"},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                StudentRecord.objects.create(
                    st_id=row["st_id"],
                    name=row["name"],
                    attendance=row["attendance"],
                    avg_test_score=row["avg_test_score"],
                    attempts=attempts,
                    fees_paid=row["fees_paid"],
                    backlogs=backlogs,
                    prediction=prediction,
                )
                inserted += 1

            return Response({
                "message": "CSV uploaded successfully.",
                "inserted": inserted,
                "skipped (duplicates)": skipped,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Failed to process file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MentorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        mentor = Mentor.objects.first()
        if not mentor:
            return Response({"error": "No mentor found"}, status=404)

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
                "date": localtime(r.date).strftime("%d/%m/%Y, %I:%M %p"),
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
    def get(self, request):
        students = StudentRecord.objects.all()

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
                # New structure: prediction is a dict
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
