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

## Detailed Guide: Hosting Your Backend on Render

### Prerequisites
- A GitHub account with your project pushed to a repository
- A valid credit card (for account verification, even though you'll use the free tier)
- Your FastAPI backend code in the `Backend` directory

### Step 1: Create a Render Account
1. Visit [render.com](https://render.com/) and click "Sign Up"
2. You can sign up using your GitHub account for easier repository access
3. Verify your email address if required

### Step 2: Connect Your GitHub Repository
1. Once logged in, click the "New +" button in the top right corner
2. Select "Web Service" from the dropdown menu
3. Choose "Connect a repository" if you signed up with GitHub, or "Public Git repository" otherwise
4. Find and select your Polling-Website repository
5. If you didn't sign up with GitHub, you'll need to paste your repository URL

### Step 3: Configure Your Web Service
1. Fill out the configuration form with the following details:
   - **Name**: `polling-website-backend` (or a name of your choice)
   - **Region**: Choose the region closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: If your backend is in a subdirectory, enter `Backend` here
   - **Runtime**: Select `Python 3`
   - **Build Command**: `pip install -r Requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Select `Free`

2. If your Requirements.txt file is in the Backend directory, adjust the build command to:
   ```
   pip install -r Backend/Requirements.txt
   ```

3. Advanced settings (optional):
   - Click "Advanced" to configure environment variables if needed
   - You can add variables like `DATABASE_URL` if you're using a database service

### Step 4: Deploy Your Service
1. Click "Create Web Service" at the bottom of the form
2. Wait for the deployment process to complete (this may take a few minutes)
3. Render will provide you with a URL (ending in `.onrender.com`) when the deployment is successful

### Step 5: Configure CORS in Your Backend
1. Update your `main.py` file with the proper CORS configuration to allow your frontend to communicate with your backend:

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "https://bryanlandsy.github.io",  # Your GitHub Pages URL
    "http://localhost:8000",          # For local development
    "https://yourusername.github.io"  # Replace with your actual GitHub Pages domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 6: Update Your Frontend Configuration
1. In your frontend code, update the API URL to point to your new Render URL
2. For example, if your fetch calls look like:
   ```javascript
   fetch('http://localhost:8000/api/polls')
   ```
   Change them to:
   ```javascript
   fetch('https://polling-website-backend.onrender.com/api/polls')
   ```

### Step 7: Verify Your Deployment
1. Test your API by visiting `https://polling-website-backend.onrender.com/docs` (replacing with your actual Render URL)
2. This will open the automatic Swagger documentation for your FastAPI backend
3. Try out some endpoints to ensure everything is working correctly

### Important Notes About Render Free Tier
- Free tier services will "sleep" after 15 minutes of inactivity
- The first request after inactivity may take up to 30 seconds to respond
- You get 750 hours of free usage per month
- Your service might not be suitable for production use on the free tier if you need consistent responsiveness
- For a production environment with many users, consider upgrading to a paid plan

### Troubleshooting Common Issues
1. **Deployment Failures**:
   - Check the build logs in Render for specific error messages
   - Ensure your Requirements.txt file contains all necessary dependencies
   - Verify the Python version compatibility

2. **CORS Errors**:
   - Double-check the CORS configuration in your FastAPI app
   - Ensure your frontend's domain is listed in the `origins` list
   - Check browser console for specific CORS error messages

3. **Database Connectivity**:
   - If using a database, ensure connection strings are properly set in environment variables
   - For SQLite, ensure the database file is in a writable location

4. **Custom Domain Setup**:
   - Under your service settings, you can configure a custom domain if needed
   - This requires verification and DNS configuration

### Monitoring Your Service
- Render provides built-in logging and monitoring tools
- Access logs by clicking on your service and selecting the "Logs" tab
- Set up notifications for deployment failures or when your service goes down

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

## Local Backend Hosting

You can host the backend on your local computer for small to medium polling events (up to ~100 users):

### Requirements
- Computer with stable internet connection
- Public IP address or port forwarding configured on your router
- Python 3.9+ installed

### Setup Steps
1. Ensure your computer is connected to the internet with a stable connection
2. Find your public IP address (visit https://whatismyip.com/)
3. Configure port forwarding on your router:
   - Forward external port 8000 to internal port 8000 on your computer's local IP
   - Consult your router's manual for specific instructions

4. Run the backend server:
   ```
   cd Backend
   pip install -r Requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

5. Your API is now accessible at `http://YOUR_PUBLIC_IP:8000`
   - Update your frontend configuration to point to this URL

### Performance Considerations
- A modern laptop/desktop should handle 100 simultaneous users for basic polling
- SQLite (the default database) can handle this load for read-heavy operations
- Keep your computer plugged in and prevent it from sleeping
- Consider using a tool like [PM2](https://pm2.keymetrics.io/) or [screen](https://www.gnu.org/software/screen/) to keep the server running if you close your terminal
- For reliability during important events, a cloud hosting solution is still recommended

### Security Considerations
- This exposes your computer directly to the internet - only do this on a secured machine
- Consider setting up basic authentication for the API
- Use HTTPS if possible (requires additional setup with certificates)
- Disable the server when not in use

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

Git branches allow you to develop features, fix bugs, or experiment with new ideas without affecting the main codebase. Here's how to work with branches:

1. List all existing branches:
   ```
   git branch          # List local branches
   git branch -r       # List remote branches
   git branch -a       # List all branches (local and remote)
   ```

2. Create a new branch:
   ```
   git checkout -b branch-name    # Create and switch to a new branch
   ```

3. Switch between branches:
   ```
   git checkout branch-name       # Switch to an existing branch
   ```

4. Push a new branch to GitHub:
   ```
   git push -u origin branch-name # Push and set upstream for the branch
   ```

5. Update a branch with changes from master/main:
   ```
   git checkout branch-name       # Switch to your branch
   git merge master               # Merge changes from master into your branch
   # OR
   git rebase master              # Rebase your branch on top of master
   ```

6. Delete a branch:
   ```
   git branch -d branch-name      # Delete a local branch (safe)
   git branch -D branch-name      # Force delete a local branch
   git push origin --delete branch-name  # Delete a remote branch
   ```

7. Viewing branch history:
   ```
   git log                        # Show commit history
   git log --graph --oneline --all # Show graphical representation of branches
   ```

8. Creating a branch for a specific purpose:
   ```
   git checkout -b feature/new-login-system   # Feature branch
   git checkout -b bugfix/header-alignment    # Bug fix branch
   git checkout -b hotfix/security-issue      # Hot fix branch
   ```

9. Stashing changes before switching branches:
   ```
   git stash                      # Stash current changes
   git checkout another-branch    # Switch branches
   git stash pop                  # Apply stashed changes (when you switch back)
   ```

## License

[Your license information here]

## Git & GitHub Learning Exercises

Use these exercises to practice and build your Git skills within this project. Complete them in order for a structured learning path.

### Basic Exercises

#### Exercise 1: Repository Setup & First Commit
1. Initialize a Git repository (if not already done):
   ```
   git init
   ```
2. Create a simple `.gitignore` file for Python and web projects:
   ```
   touch .gitignore
   # Add common entries: __pycache__/, .env, .venv/, etc.
   ```
3. Make your first commit with a proper message:
   ```
   git add .gitignore
   git commit -m "chore: add basic gitignore file"
   ```

#### Exercise 2: Working with Branches
1. Create and switch to a new feature branch:
   ```
   git checkout -b feature/dark-mode
   ```
2. Make a simple change to `Frontend/styles.css` (add a dark mode class)
3. Commit the change with a descriptive message:
   ```
   git add Frontend/styles.css
   git commit -m "feat(ui): add dark mode CSS classes"
   ```
4. Switch back to the main branch and verify the changes aren't there:
   ```
   git checkout main
   # Check that your dark mode classes are not in the file
   ```
5. Switch back to your feature branch:
   ```
   git checkout feature/dark-mode
   ```

#### Exercise 3: Merging Changes
1. Switch to the main branch:
   ```
   git checkout main
   ```
2. Merge your feature branch:
   ```
   git merge feature/dark-mode
   ```
3. Verify the changes from your feature branch are now in main
4. Use a tag to mark this version:
   ```
   git tag -a v0.2 -m "Version with dark mode support"
   ```

#### Exercise 4: Resolving Conflicts
1. Create two new branches from main:
   ```
   git checkout -b feature/update-header
   git checkout -b feature/modify-header
   ```
2. In `feature/update-header`, modify the header in `Frontend/index.html`
3. Commit your changes and switch to the other branch:
   ```
   git add Frontend/index.html
   git commit -m "feat(ui): update header with new logo"
   git checkout feature/modify-header
   ```
4. In `feature/modify-header`, modify the same section of the header differently
5. Commit your changes:
   ```
   git add Frontend/index.html
   git commit -m "feat(ui): modify header layout"
   ```
6. Switch back to main and merge the first branch:
   ```
   git checkout main
   git merge feature/update-header
   ```
7. Try to merge the second branch and resolve the conflict:
   ```
   git merge feature/modify-header
   # Resolve conflicts manually in the files
   git add Frontend/index.html
   git commit -m "merge: resolve header conflicts"
   ```

### Intermediate Exercises

#### Exercise 5: Working with Remote Repositories
1. Add your GitHub repository as a remote (if not already done):
   ```
   git remote add origin https://github.com/yourusername/Polling-Website.git
   ```
2. Push your local main branch to GitHub:
   ```
   git push -u origin main
   ```
3. Push your local tags:
   ```
   git push origin --tags
   ```
4. Push your feature branches:
   ```
   git push origin feature/dark-mode
   ```

#### Exercise 6: Pull Requests
1. On GitHub.com, create a pull request from one of your feature branches to main
2. Add a detailed description explaining the changes
3. Review your own code on GitHub's interface
4. If working with others, request a review
5. Merge the PR on GitHub

#### Exercise 7: Using GitHub Issues
1. Create an issue for a new feature: "Add user authentication"
2. Create a branch related to this issue:
   ```
   git checkout -b feature/issue-1-user-auth
   ```
3. Make some placeholder changes in the appropriate files
4. Commit with a reference to the issue:
   ```
   git commit -m "feat(auth): begin work on user authentication system, ref #1"
   ```
5. Push the branch to GitHub:
   ```
   git push -u origin feature/issue-1-user-auth
   ```
6. Create a PR and link it to the issue in the description: "Resolves #1"

#### Exercise 8: Using git stash
1. Start making changes to `Backend/main.py` (add comments or functionality)
2. Realize you need to switch branches before committing:
   ```
   git stash save "Work in progress on authentication backend"
   ```
3. Switch to another branch, then switch back:
   ```
   git checkout main
   git checkout feature/issue-1-user-auth
   ```
4. Apply your stashed changes:
   ```
   git stash list             # See all stashes
   git stash apply stash@{0}  # Apply the most recent stash
   # OR
   git stash pop              # Apply and remove the most recent stash
   ```

### Advanced Exercises

#### Exercise 9: Rebasing
1. Create a new branch off main:
   ```
   git checkout -b feature/data-export
   ```
2. Make several small commits (at least 3) for different aspects of the feature
3. Meanwhile, switch to main and make a change:
   ```
   git checkout main
   # Make a small change
   git commit -am "fix: update API response format"
   ```
4. Go back to your feature branch and rebase on main:
   ```
   git checkout feature/data-export
   git rebase main
   ```
5. Observe how your commits are now applied on top of the latest main

#### Exercise 10: Squashing Commits
1. Look at your commit history:
   ```
   git log --oneline
   ```
2. Use interactive rebase to squash some commits:
   ```
   git rebase -i HEAD~3  # Replace 3 with the number of commits back you want to go
   ```
3. In the editor, change "pick" to "squash" or "s" for commits you want to combine
4. Save and provide a new commit message for the combined commit

#### Exercise 11: Git Hooks
1. Create a simple pre-commit hook:
   ```
   mkdir -p .git/hooks
   touch .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```
2. Add a simple script to check for certain patterns before committing

#### Exercise 12: GitHub Actions
1. Create a `.github/workflows` directory:
   ```
   mkdir -p .github/workflows
   ```
2. Create a simple CI workflow file:
   ```
   touch .github/workflows/ci.yml
   ```
3. Add a basic GitHub Action to run tests when code is pushed
4. Push this change to GitHub and observe the workflow running

### Project Management Exercises

#### Exercise 13: GitHub Projects
1. Create a Project board on GitHub for your repository
2. Add columns: To Do, In Progress, Review, Done
3. Create several issues and add them to the board
4. Practice moving issues between columns as you work on them

#### Exercise 14: Releases & Versioning
1. Create a changelog file:
   ```
   touch CHANGELOG.md
   ```
2. Document changes for version 1.0.0
3. Tag this version:
   ```
   git tag -a v1.0.0 -m "Release version 1.0.0"
   ```
4. Push the tag:
   ```
   git push origin v1.0.0
   ```
5. On GitHub, create a Release based on this tag

#### Exercise 15: Contributing Guidelines
1. Create a contributing guide:
   ```
   touch CONTRIBUTING.md
   ```
2. Document how others can contribute to your project
3. Include guidelines for:
   - Code style
   - Commit message format
   - Pull request process
4. Commit and push this file

These exercises progress from basic to advanced Git and GitHub concepts. Work through them at your own pace to build proficiency with Git and GitHub workflows.
