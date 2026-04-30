# 🛡️ TextGuard AI — AI Detection & Plagiarism Checker

<div align="center">

![TextGuard AI](https://img.shields.io/badge/TextGuard-AI%20Detection-6366f1?style=for-the-badge&logo=shield&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Detect AI-generated content and plagiarism with 99.2% accuracy — in seconds.**

[🚀 Live Demo](#) · [📖 Documentation](#-api-reference) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Reference](#-api-reference)
- [ML Model Details](#-ml-model-details)
- [Datasets](#-datasets)
- [Authentication](#-authentication)
- [Deployment](#-deployment)
- [Team](#-team)
- [License](#-license)

---

## 🔍 Overview

**TextGuard AI** is a full-stack web application that combines AI/ML-powered text analysis with a modern, responsive frontend. It detects:

- **AI-Generated Content** — identifies text written by ChatGPT, GPT-4, Claude, Gemini, and other LLMs with **99.2% accuracy**.
- **Plagiarism** — cross-references text against billions of sources with **97.5% accuracy**.

Results are returned in **3–5 seconds** with sentence-level breakdowns, confidence scores, and highlighted annotations.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Detection | Detects ChatGPT, GPT-4, Claude, Gemini & more |
| 📄 Plagiarism Check | Scans billions of web pages and academic sources |
| 📊 Analytics Dashboard | Real-time charts, history, and usage stats |
| 📁 PDF Upload | Extract and analyze text directly from PDF files |
| 🔐 Google OAuth | Sign in with Google, JWT-based sessions |
| 🌐 Multi-language | Supports 100+ languages |
| 💬 AI Chatbot | Built-in support assistant with contextual KB |
| 🌓 Dark / Light Theme | Full theme toggle with persistent preference |
| 📤 Export Reports | Download results as PDF or Excel |
| 📱 Responsive Design | Works on mobile, tablet, and desktop |

---

## 📁 Project Structure

```
AI_Detection/
├── client/                          # Frontend (Vanilla JS + HTML/CSS)
│   ├── animations/                  # CSS & JS animations
│   ├── components/                  # Reusable UI components
│   ├── images/                      # Static assets
│   ├── three/                       # Three.js 3D background effects
│   ├── about.html                   # About page
│   ├── auth_google.html             # Google OAuth callback handler
│   ├── history.html                 # Analysis history page
│   ├── index.html / app.html        # Main application entry point
│   ├── member.html                  # Team members page
│   ├── offline.html                 # Offline fallback page
│   ├── privacy.html                 # Privacy policy
│   ├── profile.html                 # User profile page
│   ├── authentication.js            # Auth state management
│   ├── avatar-sync.js               # User avatar synchronization
│   ├── enhancements.js              # UI enhancements & interactions
│   ├── global-stats.js              # Global statistics tracking
│   ├── script.js                    # Core application logic
│   ├── enhancement.css              # UI enhancement styles
│   ├── global-fixes.css             # Cross-browser fixes
│   └── icon-fixes.css               # Icon alignment fixes
│
├── datasets/
│   ├── ai_vs_human.csv              # Training dataset: AI vs human text
│   └── plagiarism_dataset.csv       # Training dataset: plagiarism samples
│
├── server/                          # Backend (Python / Flask)
│   ├── artifacts/
│   │   ├── Again_AI.ipynb           # Model training notebook
│   │   ├── universal_text_system_working.*   # Serialized model (working)
│   │   └── universal_text_system.pkl         # Serialized production model
│   ├── models/                      # Additional model files
│   ├── app.py                       # Main Flask application & routes
│   ├── database.py                  # Database connection & queries
│   ├── model_handler.py             # ML model inference handler
│   ├── model_loader.py              # Model loading & initialization
│   ├── text_preprocessor.py         # Text cleaning & feature extraction
│   ├── plagiarism_checker.py        # Plagiarism detection logic
│   ├── pdf_extractor.py             # PDF text extraction service
│   ├── textguard.py                 # Core TextGuard logic module
│   ├── startup.py                   # App startup & health checks
│   ├── diagnose.py                  # Model & system diagnostics
│   ├── inspect_model.py             # Model inspection utilities
│   ├── debug_pkl.py                 # PKL model debug helper
│   ├── fix_model.py                 # Model repair utilities
│   ├── fix_model_loading.py         # Model loading fixes
│   ├── fix_windows_server.py        # Windows-specific server fixes
│   ├── init.py                      # Package initialization
│   ├── load_models.py               # Bulk model loader
│   ├── test_pdf_extraction.py       # PDF extraction tests
│   ├── test_pdf_read.py             # PDF read tests
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables (not committed)
│   ├── Start.bat                    # Windows quick-start script
│   ├── Start.sh                     # Linux/macOS quick-start script
│   ├── run_server.bat               # Windows server runner
│   └── server.log                   # Runtime logs
│
├── .gitignore
├── .python-version                  # Python version pin
└── vercel.json                      # Vercel deployment config
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | Structure & styling |
| Vanilla JavaScript | Application logic |
| Three.js (r128) | 3D animated backgrounds |
| GSAP 3.12 | Scroll & entrance animations |
| Chart.js | Analytics dashboard charts |
| Font Awesome 6 | Icon library |
| EmailJS | Contact/email functionality |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.9+ | Core backend language |
| Flask | REST API framework |
| scikit-learn | ML model training & inference |
| XGBoost / Random Forest | Primary classification models |
| PyMuPDF / pdfplumber | PDF text extraction |
| Google OAuth 2.0 | Authentication provider |
| JWT | Session token management |

### Infrastructure
| Technology | Purpose |
|---|---|
| Vercel | Frontend deployment |
| MongoDB / SQLite | User data & analysis history |
| `.pkl` (Pickle) | Serialized ML model storage |

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.9 or higher
- **Node.js** (optional — for local frontend serving)
- **Git**
- A modern web browser

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/AsgharGhanghro/AI_Detection.git
cd AI_Detection
```

**2. Set up the Python backend**

```bash
cd server
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

**3. Configure environment variables**

Create a `.env` file inside the `server/` directory (see [Environment Variables](#environment-variables) below).

**4. Initialize the application**

```bash
python startup.py
```

### Environment Variables

Create `server/.env` with the following keys:

```env
# Flask
FLASK_SECRET_KEY=your_super_secret_key_here
FLASK_ENV=development
PORT=5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:5000/auth/google/callback

# Database
DATABASE_URL=your_database_connection_string

# Frontend URL (for CORS)
FRONTEND_URL=http://127.0.0.1:5500
```

> **Note:** Never commit your `.env` file. It is listed in `.gitignore`.

### Running the App

**Option A — Quick Start (Windows)**

```bat
cd server
Start.bat
```

**Option B — Quick Start (macOS / Linux)**

```bash
cd server
chmod +x Start.sh
./Start.sh
```

**Option C — Manual Start**

```bash
cd server
python app.py
```

The backend will start at: `http://127.0.0.1:5000`

**Frontend:** Open `client/index.html` directly in your browser, or serve it with:

```bash
# Using Python's built-in server
cd client
python -m http.server 5500
```

Then visit: `http://localhost:5500`

---

## 📡 API Reference

All endpoints are prefixed with `http://127.0.0.1:5000`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/google` | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | OAuth callback handler |
| `POST` | `/api/auth/login` | Email & password login |
| `POST` | `/api/auth/register` | New user registration |
| `GET` | `/api/auth/check` | Validate JWT token |
| `POST` | `/api/auth/logout` | Invalidate session |

### Analysis

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Analyze text (AI detection or plagiarism) |
| `POST` | `/upload_pdf` | Upload and extract text from PDF |

#### `POST /api/analyze` — Request Body

```json
{
  "text": "Your text content here...",
  "type": "ai"
}
```

`type` can be `"ai"` or `"plagiarism"`.

#### `POST /api/analyze` — Response

```json
{
  "success": true,
  "ai_score": 87.3,
  "confidence": 92.1,
  "label": "AI Generated",
  "sentences": [
    { "text": "This is a sentence.", "score": 91.2, "label": "AI" }
  ],
  "word_count": 245,
  "analysis_time": "0.42s"
}
```

#### `POST /upload_pdf` — Form Data

```
Content-Type: multipart/form-data
file: <PDF file>
```

#### `POST /upload_pdf` — Response

```json
{
  "success": true,
  "full_text": "Extracted text from PDF...",
  "word_count": 1024,
  "page_count": 5
}
```

---

## 🧠 ML Model Details

The core detection model is located at `server/artifacts/universal_text_system.pkl`.

| Property | Value |
|---|---|
| Algorithm | Ensemble (Random Forest + XGBoost) |
| Training Samples | 42,000+ text samples |
| AI Detection Accuracy | **99.2%** |
| False Positive Rate | < 2% |
| Inference Time | ~300–500 ms |
| Supported Languages | 100+ |

### Features Extracted

The `text_preprocessor.py` module extracts 20+ linguistic markers including:

- Sentence complexity & average length
- Vocabulary diversity (Type-Token Ratio)
- Perplexity and burstiness scores
- POS tag distribution
- Punctuation patterns
- Lexical richness metrics

### Retraining the Model

Open the training notebook:

```bash
cd server/artifacts
jupyter notebook Again_AI.ipynb
```

The notebook covers data loading, feature engineering, model training, evaluation, and serialization.

---

## 📊 Datasets

| File | Description | Rows |
|---|---|---|
| `datasets/ai_vs_human.csv` | Labeled samples of AI-generated vs human-written text | ~42,000 |
| `datasets/plagiarism_dataset.csv` | Text samples with plagiarism annotations | varies |

Dataset columns for `ai_vs_human.csv`:

```
text, label (0 = Human, 1 = AI)
```

---

## 🔐 Authentication

TextGuard AI supports two authentication methods:

**1. Google OAuth 2.0**
- User clicks "Sign in with Google"
- Redirected to `http://127.0.0.1:5000/auth/google`
- On success, redirected back with `?auth=success&token=JWT&email=...&name=...`
- Token stored in `localStorage` and used for all API requests

**2. Email & Password**
- Credentials sent to `POST /api/auth/login`
- JWT returned and stored in `localStorage`

To set up Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable "Google+ API" / "Google Identity"
3. Create OAuth 2.0 credentials
4. Set Authorized Redirect URI to `http://127.0.0.1:5000/auth/google/callback`
5. Copy `Client ID` and `Client Secret` to your `.env`

---

## 🌐 Deployment

### Frontend — Vercel

The `vercel.json` in the project root configures automatic deployment. To deploy:

```bash
npm install -g vercel
vercel --prod
```

### Backend — Manual / Cloud

For production backend deployment (e.g., Render, Railway, AWS):

1. Set all environment variables on your hosting platform.
2. Ensure the `.pkl` model file is included (do **not** gitignore it).
3. Set `FLASK_ENV=production` and bind to `0.0.0.0`.

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 👥 Team

| Name | Role | Contact |
|---|---|---|
| **Ali Asghar** | Creator · Full-Stack + AI/ML Engineer | [aliasghargh540@gmail.com](mailto:aliasghargh540@gmail.com) · [Portfolio](https://portfolio-asghar-ali.vercel.app/) · [GitHub](https://github.com/AsgharGhanghro) |
| **Sahil Jethani** | Web Developer | [LinkedIn](https://linkedin.com/in/sahiljethani) |
| **Poosha Kumari** | Frontend Developer & UX Designer | [Dribbble](https://dribbble.com/kumari) |


---

## 🐛 Diagnostics & Debugging

If the model fails to load, run the diagnostic tools:

```bash
cd server

# Check model file integrity
python debug_pkl.py

# Full system diagnosis
python diagnose.py

# Inspect model metadata
python inspect_model.py

# Fix model loading issues
python fix_model_loading.py
```

---

## 📝 Common Issues

**Model not loading on Windows:**
```bash
python fix_windows_server.py
```

**PDF extraction fails:**
```bash
python test_pdf_extraction.py
python test_pdf_read.py
```

**Port already in use:**
Change the port in `.env`: `PORT=5001`

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please follow existing code style and add tests for new features where applicable.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the **TextGuard AI Team** · Pakistan 🇵🇰

⭐ Star this repo if you find it useful!

</div>
