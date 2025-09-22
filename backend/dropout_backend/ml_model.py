import joblib
import os
import numpy as np

# Get base directory: two levels up from this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path to your models folder: backend/models inside BASE_DIR
MODEL_DIR = os.path.join(BASE_DIR, 'backend', 'models')

# Model file paths
rf_model_path = os.path.join(MODEL_DIR, 'rf_model.pkl')
scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
label_encoder_path = os.path.join(MODEL_DIR, 'le_dropout.pkl')
feature_names_path = os.path.join(MODEL_DIR, 'feature_names.pkl')

# Load the trained model and preprocessing tools
rf_model = joblib.load(rf_model_path)
scaler = joblib.load(scaler_path)
label_encoder = joblib.load(label_encoder_path)
feature_names = joblib.load(feature_names_path)

def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj
    
def predict_from_model(input_data):
    try:
        if isinstance(input_data, list):
            if len(input_data) != len(feature_names):
                raise ValueError(f"Expected {len(feature_names)} features, got {len(input_data)}")
            input_data = dict(zip(feature_names, input_data))

        input_vector = []

        for feature in feature_names:
            value = input_data.get(feature)
            if value is None:
                if feature == 'Current_CGPA':
                    input_vector.append(0.0)
                else:
                    input_vector.append(0)
            else:
                input_vector.append(float(value))

        input_array = np.array(input_vector).reshape(1, -1)
        scaled_data = scaler.transform(input_array)

        prediction_encoded = rf_model.predict(scaled_data)[0]
        prediction_proba = rf_model.predict_proba(scaled_data)[0][1]
        prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]
        prediction_percentage = prediction_proba * 100

        if prediction_percentage < 30:
            risk_level = "Low Risk"
        elif prediction_percentage < 70:
            risk_level = "Medium Risk"
        else:
            risk_level = "High Risk"

        result = {
            "predicted_label": prediction_label,
            "prediction_percentage": round(float(prediction_percentage), 2),
            "risk_level": risk_level
        }

        # ✅ Properly return the converted result
        return convert_numpy_types(result)

    except Exception as e:
        raise ValueError(f"Prediction failed: {e}")

