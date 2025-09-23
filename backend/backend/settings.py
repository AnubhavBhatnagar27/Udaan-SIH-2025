from datetime import timedelta
from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-2w_yq$cq&wzz2480y_d&m*8wabd%19^1w2evyxj7n(fieq1*te'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['your-backend-name.onrender.com']

FAST2SMS_API_KEY=os.getenv("FAST2SMS_API_KEY","63XGTKBDVFeMUbNidClHEIWAfqv485kZPmuLSYcny2sQgpOtxwt0fRy1ZYoW45njSpNAVabmOMKQLdEX")

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'dropout_backend',
    'corsheaders',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = ["https://udaan-sih-2025.vercel.app/",]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# AUTH LOGIN
import datetime

# JWT_AUTH = {
#     "JWT_ENCODE_HANDLER": "rest_framework_jwt.utils.jwt_encode_handler",
#     "JWT_DECODE_HANDLER": "rest_framework_jwt.utils.jwt_decode_handler",
#     "JWT_PAYLOAD_HANDLER": "rest_framework_jwt.utils.jwt_payload_handler",
#     "JWT_PAYLOAD_GET_USER_ID_HANDLER": "rest_framework_jwt.utils.jwt_get_user_id_from_payload_handler",
#     "JWT_RESPONSE_PAYLOAD_HANDLER": "rest_framework_jwt.utils.jwt_response_payload_handler",
#     "JWT_SECRET_KEY": SECRET_KEY,
#     "JWT_GET_USER_SECRET_KEY": None,
#     "JWT_PUBLIC_KEY": None,
#     "JWT_PRIVATE_KEY": None,
#     "JWT_ALGORITHM": "HS256",
#     "JWT_VERIFY": True,
#     "JWT_VERIFY_EXPIRATION": True,
#     "JWT_LEEWAY": 0,
#     "JWT_EXPIRATION_DELTA": datetime.timedelta(days=180),
#     "JWT_AUDIENCE": "loyalty",
#     "JWT_ISSUER": None,
#     "JWT_ALLOW_REFRESH": True,
#     "JWT_REFRESH_EXPIRATION_DELTA": datetime.timedelta(days=365),
#     "JWT_AUTH_HEADER_PREFIX": "LOYALTY_TOKEN",
#     "JWT_AUTH_COOKIE": None,
# }

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),     # ⏱ Access token valid for 1 hour
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),     # 🔁 Refresh token valid for 7 days
    "ROTATE_REFRESH_TOKENS": True,                  # Optional: refresh token gets rotated on use
    "BLACKLIST_AFTER_ROTATION": True,               # Optional: disables old refresh tokens
    "AUTH_HEADER_TYPES": ("Bearer",),               # Default is "Bearer"
}