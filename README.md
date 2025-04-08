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
