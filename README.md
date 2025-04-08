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

The frontend is hosted on GitHub Pages: [GitHub Pages URL here]

### Backend

The backend API is deployed separately and can be self-hosted. See the `Backend` directory for more details.

## Development Setup

1. Clone this repository
2. Set up the backend:
   ```
   cd Backend
   pip install -r Requirements.txt
   uvicorn main:app --reload
   ```
3. Open the `Frontend/index.html` file in your browser

## License

[Your license information here]
