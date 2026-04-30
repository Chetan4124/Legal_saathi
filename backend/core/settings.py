from pathlib import Path
from decouple import config
from datetime import timedelta

# ─────────────────────────────────────────
# BASE
# ─────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='change-me-in-production')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')


# ─────────────────────────────────────────
# APPS
# ─────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

LOCAL_APPS = [
    'users',
    'documents',
    'ocr',
    'chats',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS


# ─────────────────────────────────────────
# MIDDLEWARE
# ─────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# ─────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────
# Using SQLite for development — easy, no setup needed
# Switch to PostgreSQL for production by uncommenting below

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# PostgreSQL (uncomment when deploying)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME'),
#         'USER': config('DB_USER'),
#         'PASSWORD': config('DB_PASSWORD'),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#     }
# }


# ─────────────────────────────────────────
# CUSTOM USER MODEL
# ─────────────────────────────────────────
AUTH_USER_MODEL = 'users.User'


# ─────────────────────────────────────────
# PASSWORD VALIDATION
# ─────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ─────────────────────────────────────────
# INTERNATIONALISATION
# ─────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True


# ─────────────────────────────────────────
# STATIC & MEDIA FILES
# ─────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'          # Uploaded legal documents land here


# ─────────────────────────────────────────
# DEFAULT PRIMARY KEY
# ─────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ─────────────────────────────────────────
# DJANGO REST FRAMEWORK
# ─────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',  # All endpoints require login by default
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
}


# ─────────────────────────────────────────
# JWT SETTINGS
# ─────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,          # New refresh token on every refresh
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}


# ─────────────────────────────────────────
# CORS (React frontend access)
# ─────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',    # Vite dev server
    'http://localhost:3000',    # CRA dev server (just in case)
]

CORS_ALLOW_CREDENTIALS = True   # Allow cookies / auth headers


# ─────────────────────────────────────────
# FILE UPLOAD SETTINGS
# ─────────────────────────────────────────
# Only allow PDF and image uploads for legal documents
ALLOWED_UPLOAD_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']
MAX_UPLOAD_SIZE_MB = 10   # 10 MB limit


# ─────────────────────────────────────────
# AI AGENT SETTINGS
# ─────────────────────────────────────────
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
# ANTHROPIC_API_KEY = config('ANTHROPIC_API_KEY', default='')  # Uncomment for Claude
GEMINI_API_KEY = config('AIzaSyBHCGp3Yqrst8gHcAatBByJEoVL49h3ZpE', default='')  # ← ADD THIS


# ChromaDB will store vector embeddings here (local folder, no extra setup)
CHROMA_DB_PATH = str(BASE_DIR / 'chroma_db')