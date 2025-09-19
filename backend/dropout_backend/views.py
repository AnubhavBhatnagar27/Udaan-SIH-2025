from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .ml_model import predict_from_model
import pandas as pd
from rest_framework.parsers import MultiPartParser, FormParser

class StudentRecordView(APIView):
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
                int(data["fees_paid"]),
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


# ✅ NEW CLASS TO HANDLE CSV FILE UPLOAD
from rest_framework.parsers import MultiPartParser, FormParser

class UploadCSVView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_csv(file_obj)

            # Check required columns exist
            required_columns = ["st_id", "name", "attendance", "avg_test_score", "fees_paid"]
            for col in required_columns:
                if col not in df.columns:
                    return Response({"error": f"Missing column: {col}"}, status=status.HTTP_400_BAD_REQUEST)

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
                    int(attempts),
                    int(row["fees_paid"]),
                    int(backlogs),
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

class LoginView(APIView):
    def post(self, request):
        data = request.data
        required_fields = ["username", "password"]

        for field in required_fields:
            if field not in data:
                return Response({"error": f"Missing field: {field}"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # user = Login.objects.get(username=data["username"], password=data["password"])
            try:
                userexist=Login.objects.get(username=data["username"], password=data["password"])
            except Exception as e :
                return Response({"message": "Login Failed"}, status=status.HTTP_401_UNAUTHORIZED)
            ls=Login.objects.create(username=data["username"], password=data["password"])
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        except Login.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        

class CreateLogin(APIView):
    def post(self, request):
        data = request.data
        required_fields = ["username", "password"]

        for field in required_fields:
            if field not in data:
                return Response({"error": f"Missing field: {field}"}, status=status.HTTP_400_BAD_REQUEST)

        if Login.objects.filter(username=data["username"]).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        Login.objects.create(
            username=data["username"],
            password=data["password"]
        )

        return Response({
            "message": "User created successfully."
        }, status=status.HTTP_201_CREATED)