# Udaan-SIH-2025 - Team BitCrew

## Project Overview

This repository contains the code for Team BitCrew's solution for SIH 2025 (Smart India Hackathon). Our project aims to develop an AI-powered platform for dropout prediction using machine learning techniques and a user-friendly interface. This README provides a comprehensive guide for understanding, setting up, and contributing to the project.

## Key Features & Benefits

*   **AI-Powered Dropout Prediction:** Utilizes machine learning models to predict student dropout rates.
*   **User-Friendly Interface:** Provides an intuitive interface for data input and visualization of prediction results
*   **Scalable Architecture:** Designed with scalability in mind to handle large datasets and user traffic.
*   **Data Analysis & Insights:** Risk Analytics overview dashboard

## Prerequisites & Dependencies

Before setting up the project, ensure you have the following installed:

*   **Python:** Version 3.6 or higher.
*   **Node.js:** Version 14 or higher.
*   **npm:** (Usually installed with Node.js)
*   **pip:** (Python package installer)

The following libraries are also required:

*   **JavaScript:**
    *   React JS
*   **Python:**
    *   Django
    *   scikit-learn (sklearn)
    *   pandas
    *   numpy
    *   dotenv

## Installation & Setup Instructions

Follow these steps to install and set up the project:

1.  **Clone the repository:**

    ```bash
    git clone [repository URL]
    cd Udaan-SIH-2025
    ```

2.  **Backend Setup (Python/Django):**

    a.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

    b.  Create a virtual environment (recommended):

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Linux/macOS
    venv\Scripts\activate  # On Windows
    ```

    c.  Install the required Python packages:

    ```bash
    pip install -r requirements.txt #Create a requirements.txt file that contains all the python dependencies and include in backend folder.
    ```

    d.  Apply migrations:

    ```bash
    python manage.py migrate
    ```

    e.  Run the development server:

    ```bash
    python manage.py runserver
    ```

3.  **Frontend Setup (JavaScript/React - *If Applicable*):**

    a.  Navigate to the `frontend` directory [If you have a front end]:

    ```bash
    cd frontend
    ```

    b.  Install the required Node.js packages:

    ```bash
    npm install
    ```

    c.  Start the development server:

    ```bash
    npm start
    ```

4.  **Environment Variables:**

    Create a `.env` file in the root directory of the project and define the following environment variables:

    ```
    DEBUG=True
    SECRET_KEY=your_django_secret_key
    [Other ENV variables as needed]
    ```

## Usage Examples & API Documentation

### Backend (API Endpoints):

The Django backend provides the following API endpoints:

*   `/`: Landing Page
*  `/login/create/` : User Creation
*  `/login/` : User Login
*  `/upload/` : Upload Student Data
*  `/students/` : Student Data API
*  `/students/<int:st_id>/` : Individual Student Data
*  `/students/<int:st_id>/remarks/` : Individual Student Remarks
*  `/risk-analytis/` : Risk Analytics Overview
*   `/mentors/`: Mentor Data
*   `/token/refresh`: For JWT Authentication
*  `/send-email/` : Email Sending Facility

Example `POST` request to the `/login/` endpoint:

```json
{
  "username": testuser@gmail.com ,
  "password": testpass123
}
```


## Configuration Options

The project can be configured using the following settings:

*   **`SECRET_KEY`:**  Django's secret key (stored in `.env`).  Ensure this is a strong, unique value for production environments.
*   **`DEBUG`:**  Enables or disables debugging mode (stored in `.env`). Should be `False` for production.
*   **Database Settings:** Configure the database connection in `backend/backend/settings.py`.
*   **[Other configuration settings]**


*   Developed by Team BitCrew2 under SIH 2025.
