# Polling Website

An interactive web application for collecting and visualizing pre- and post-activity poll data.

## Features

- Pre-activity and post-activity polling
- Support for multiple question types (text, rating, checkbox)
- Real-time analytics and visualizations
- Presenter view with comprehensive analytics
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: FastAPI (Python)
- **Database**: SQLite (development), can be configured for other databases
- **Visualization**: D3.js

## Usage

### User Mode

- Access the pre-poll: `index.html?poll=pre`
- Access the post-poll: `index.html?poll=post`

### Presenter Mode

- Access analytics: `index.html?access=presenter2023`

## Deployment

### Frontend

The frontend is hosted on GitHub Pages. To access the live site, visit: [GitHub Pages URL]

#### GitHub Pages Deployment Notes
- The site is deployed from the `docs` folder
- Frontend code in the `docs` folder is a copy of the `Frontend` directory

### Backend API

The backend API needs to be deployed separately. Options include:
- Heroku
- AWS Lambda
- Azure Functions
- Your own server

See the `Backend` directory for more details on deploying the backend.

### Free Backend Hosting Options

#### 1. Render.com (Recommended)

Render offers a free tier that's perfect for FastAPI applications:

1. Sign up at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository 
4. Configure your service:
   - Runtime: Python 3.9 (or newer)
   - Build Command: `pip install -r Backend/Requirements.txt`
   - Start Command: `cd Backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Select the free plan

Note: The free tier may sleep after inactivity, causing slow initial responses.

#### 2. Railway.app

Railway offers a free starter plan with usage limits:

1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add a service from your GitHub repository
4. Configure deployment settings:
   - Set the root directory to `/Backend`
   - Set environment variables if needed
   - Add a `Procfile` in the Backend directory with: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 3. Fly.io

Fly.io offers a generous free tier:

1. Sign up at [fly.io](https://fly.io)
2. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
3. Login: `fly auth login`
4. Navigate to your Backend directory and create a `fly.toml` file:
   ```toml
   app = "your-app-name"
   
   [build]
     builder = "paketobuildpacks/builder:base"
   
   [env]
     PORT = "8080"
   
   [[services]]
     internal_port = 8080
     protocol = "tcp"
   
     [[services.ports]]
       port = 80
       handlers = ["http"]
     
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```
5. Create a `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port 8080`
6. Deploy: `fly launch`

#### 4. Deta.sh (Now Deta Space)

Deta Space offers a completely free hosting option:

1. Sign up at [deta.space](https://deta.space)
2. Install Deta CLI: `curl -fsSL https://get.deta.dev/space-cli.sh | sh`
3. Login: `space login`
4. Initialize in your Backend directory: `space new`
5. Create a `Spacefile` with:
   ```yaml
   v: 0
   micros:
     - name: fastapi-backend
       src: .
       engine: python3.9
       primary: true
       run: uvicorn main:app
       public: true
   ```
6. Deploy: `space push`

#### CORS Configuration

When hosting your backend separately from your frontend, you'll need to configure CORS in your FastAPI application. Add this to your `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

# Add your frontend URL to origins
origins = [
    "https://bryanlandsy.github.io",  # Your GitHub Pages URL
    "http://localhost:8000",  # For local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Development Setup

1. Clone this repository
2. Set up the backend:
   ```
   cd Backend
   pip install -r Requirements.txt
   uvicorn main:app --reload
   ```
3. Open the `Frontend/index.html` file in your browser

## GitHub Workflow

### First-time Setup

If you haven't set up your GitHub credentials:

1. Configure your Git identity:
   ```
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. If you haven't cloned this repository yet:
   ```
   git clone https://github.com/yourusername/Polling-Website.git
   cd Polling-Website
   ```

### Pushing Changes to GitHub

1. Check which files have been changed:
   ```
   git status
   ```

2. Stage your changes:
   ```
   git add .                 # Add all changes
   # OR
   git add specific-file.js  # Add specific files
   ```

3. Commit your changes with a descriptive message:
   ```
   git commit -m "Brief description of your changes"
   ```

4. Push your changes to GitHub:
   ```
   git pull                  # Optional: Get latest changes from remote
   git push origin master    # Push to master branch
   ```

### Working with Branches

1. Create a new branch for your feature:
   ```
   git checkout -b feature-name
   ```

2. Push a new branch to GitHub:
   ```
   git push -u origin feature-name
   ```

3. Switch between branches:
   ```
   git checkout branch-name
   ```

## License

[Your license information here]
