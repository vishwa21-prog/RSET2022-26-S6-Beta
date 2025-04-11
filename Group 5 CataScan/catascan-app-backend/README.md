# CataScan API Documentation

CataScan Backend is a Flask-based API that powers the CataScan web application for early cataract detection. It provides endpoints for user authentication, profile management, image upload, prediction, and report generation. The backend integrates with Supabase for database and storage operations and uses a TensorFlow model for cataract prediction.

This document outlines the API endpoints for the CataScan application.

## Table of Contents

- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
  - [Upload Image](#upload-image)
  - [Predict](#predict)
  - [Signup](#signup)
  - [Onboarding](#onboarding)
  - [Signin](#signin)
  - [Get Profile](#get-profile)
  - [Update Profile](#update-profile)
  - [Upload Profile Image](#upload-profile-image)
  - [Download Report](#download-report)
  - [Get Scans](#get-scans)
  - [Test Supabase](#test-supabase)

## Environment Setup

Follow these steps to set up and run the Flask project using `requirements.txt`.

#### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone "https://github.com/GeorgeET15/catascan-app-backend"
cd catascan-app-backend
```

#### 2. Install Conda (If Not Installed)

If you don’t have Conda installed, download and install it from the [official site](https://docs.conda.io/projects/conda/en/stable/user-guide/install/windows.html).

#### 3. Create and Activate a Conda Environment

If you haven't already created a Conda environment for this project, run the following command:

```bash
conda create --name CataScan python=3.9.18 -y
conda activate CataScan
```

#### 4. Install Dependencies

Once your Conda environment is activated, install the required dependencies from requirements.txt:

```bash
pip install -r requirements.txt
```

#### 5. Download the Model

The [CataScan_v1](https://drive.google.com/file/d/1daZn222jSRThK9qFua88cgljJ51Fr9mv/view?usp=sharing) model in a state of the art Cataract Detection model trained on a wide variety of image datasets. Download it and place it in the catascan-app-backend folder.

#### 6. Starting the dev derver

```bash
python ./server.py
```

# API Endpoints

### Upload Image

- **Endpoint:** `/upload-image`
- **Method:** `POST`
- **Description:** Uploads an image for cataract detection.
- **Headers:**
  - `Content-Type: multipart/form-data`
- **Body:**
  - `file`: Image file (PNG, JPG, JPEG).
  - `user_id`: User ID associated with the image.
- **Response:**
  - **Success (200):**
    ```json
    {
      "message": "Image uploaded successfully",
      "scan_id": "<scan_id>",
      "image_url": "<image_url>",
      "user_id": "<user_id>"
    }
    ```
  - **Error (400, 500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Predict

- **Endpoint:** `/predict`
- **Method:** `POST`
- **Description:** Predicts the presence and severity of cataracts in an image.
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "image_url": "<image_url>",
    "scan_id": "<scan_id>",
    "user_id": "<user_id>"
  }
  ```
- **Response:**
  - **Success (200):**
    ```json
    {
      "scan_id": "<scan_id>",
      "user_id": "<user_id>",
      "prediction": "Cataract", // Or "No Cataract"
      "confidence": 0.85, // Example confidence value
      "severity": "Severe", // Or "Mild to Moderate" or "None"
      "feedback": "Analysis completed successfully.",
      "recommendation": "Consult an eye specialist for further evaluation.",
      "processing_time": 1.23, // Example processing time in seconds
      "model_version": "CataScan_v1"
    }
    ```
  - **Error (400, 500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Signup

- **Endpoint:** `/signup`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "<email>",
    "password": "<password>"
  }
  ```
- **Response:**
  - **Success (201):**
    ```json
    {
      "message": "Sign-up successful",
      "user_id": "<user_id>",
      "access_token": "<access_token>"
    }
    ```
  - **Error (400, 500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Onboarding

- **Endpoint:** `/onboarding`
- **Method:** `POST`
- **Description:** Updates user profile information.
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "user_id": "<user_id>",
    "first_name": "<first_name>",
    "last_name": "<last_name>",
    "gender": "<gender>",
    "dob": "<dob>",
    "age": "<age>",
    "address": "<address>"
  }
  ```
- **Response:**
  - **Success (200):**
    ```json
    {
      "message": "Onboarding successful"
    }
    ```
  - **Error (400, 500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Signin

- **Endpoint:** `/signin`
- **Method:** `POST`
- **Description:** Authenticates a user and returns an access token.
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "<email>",
    "password": "<password>"
  }
  ```
- **Response:**
  - **Success (200):**
    ```json
    {
      "message": "Sign-in successful",
      "user_id": "<user_id>",
      "access_token": "<access_token>"
    }
    ```
  - **Error (401, 400):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Get Profile

- **Endpoint:** `/profile`
- **Method:** `GET`
- **Description:** Retrieves user profile information.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - **Success (200):**
    ```json
    {
        "profile": {
            "<profile_data>"
        },
        "avatar_url": "<avatar_url>"
    }
    ```
  - **Error (404, 500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Update Profile

- **Endpoint:** `/profile`
- **Method:** `PUT`
- **Description:** Updates user profile information.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "first_name": "<first_name>",
    "last_name": "<last_name>",
    "gender": "<gender>",
    "dob": "<dob>",
    "age": "<age>",
    "address": "<address>"
  }
  ```
- **Response:**
  - **Success (200):**
    ```json
    {
      "message": "Profile updated successfully"
    }
    ```
  - **Error (500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Upload Profile Image

- **Endpoint:** `/profile/image`
- **Method:** `POST`
- **Description:** Uploads a profile image for the user.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body:**
  - `file`: Image file (PNG, JPG, JPEG).
- **Response:**
  - **Success (200):**
    ```json
    {
      "message": "Profile image uploaded successfully",
      "avatar_url": "<public_url>"
    }
    ```
  - **Error (500,400):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Download Report

- **Endpoint:** `/download_report`
- **Method:** `GET`
- **Description:** Downloads a PDF report of a scan.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:**
  - `scanId`: The ID of the scan.
- **Response:**
  - **Success (200):** Returns a PDF file.
  - **Error (400, 404, 500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Get Scans

- **Endpoint:** `/scans`
- **Method:** `GET`
- **Description:** Retrieves a list of scans for the authenticated user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response:**
  - **Success (200):**
    ```json
    [
        {
            "<scan_data>"
        },
        ...
    ]
    ```
  - **Error (500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

### Test Supabase

- **Endpoint:** `/test-supabase`
- **Method:** `GET`
- **Description:** Tests the connection to Supabase.
- **Response:**
  - **Success (200):**
    ```json
    {
      "message": "Supabase connection successful",
      "data": "<supabase_data>"
    }
    ```
  - **Error (500):**
    ```json
    {
      "error": "<error_message>"
    }
    ```

**Support and Contact:**

If you encounter any issues, have questions, or require further assistance, please reach out to our support team at [catascan@gmail.com](mailto:catascan@gmail.com). We are committed to providing timely and effective support to ensure a seamless experience with our API.

**Version Control:**

This documentation reflects the current state of the CataScan API. We encourage you to check for updates regularly, as we continuously improve and expand our services. Versioning information and release notes can be found on our GitHub repository or through our developer portal.

**Copyright and Licensing:**

© 2025 CataScan. All rights reserved. This API and its documentation are protected by copyright and other intellectual property laws. Unauthorized reproduction or distribution is prohibited. For licensing inquiries, please contact [catascan@gmail.com](mailto:catascan@gmail.com).

**Disclaimer:**

The information contained in this document is subject to change without notice. CataScan provides this API and documentation "as is" without warranty of any kind, either expressed or implied. CataScan shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of this API.
