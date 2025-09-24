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

# Global variables to store loaded models (lazy loading)
rf_model = None
scaler = None
label_encoder = None
feature_names = None

def load_models():
    """Load ML models lazily to avoid import-time errors"""
    global rf_model, scaler, label_encoder, feature_names
    
    if rf_model is None:
        try:
            rf_model = joblib.load(rf_model_path)
            scaler = joblib.load(scaler_path)
            label_encoder = joblib.load(label_encoder_path)
            feature_names = joblib.load(feature_names_path)
        except Exception as e:
            # If models can't be loaded, create dummy models for development
            print(f"Warning: Could not load ML models: {e}")
            print("Using dummy models for development")
            
            # Create dummy models that won't break the system
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.preprocessing import StandardScaler, LabelEncoder
            
            rf_model = RandomForestClassifier(n_estimators=10, random_state=42)
            scaler = StandardScaler()
            label_encoder = LabelEncoder()
            feature_names = ['attendance', 'avg_test_score', 'attempts', 'fees_paid', 'backlogs', 'Current_CGPA']
            
            # Fit dummy models with sample data
            import numpy as np
            dummy_data = np.random.rand(10, 6)
            dummy_labels = np.random.randint(0, 2, 10)
            
            scaler.fit(dummy_data)
            label_encoder.fit(['No Dropout', 'Dropout'])
            rf_model.fit(scaler.transform(dummy_data), dummy_labels)

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
        # Load models if not already loaded
        load_models()
        
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

