import joblib
import os
import numpy as np

# Get base directory: two levels up from this file (dropout_backend/ml_model.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path to your models folder: backend/models inside BASE_DIR
MODEL_DIR = os.path.join(BASE_DIR, 'backend', 'models')

# Model file paths
rf_model_path = os.path.join(MODEL_DIR, 'rf_model.pkl')
scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
label_encoder_path = os.path.join(MODEL_DIR, 'le_dropout.pkl')

# Load the models with joblib
rf_model = joblib.load(rf_model_path)
scaler = joblib.load(scaler_path)
label_encoder = joblib.load(label_encoder_path)

def predict_from_model(input_data):
    """
    input_data: list of numerical features, e.g. [3.2, 1.5, 0.8, ...]
    """
    try:
        input_array = np.array(input_data).reshape(1, -1)
        scaled_data = scaler.transform(input_array)
        prediction_encoded = rf_model.predict(scaled_data)
        prediction_label = label_encoder.inverse_transform(prediction_encoded)
        return prediction_label[0]
    except Exception as e:
        raise ValueError(f"Prediction failed: {e}")
