import os
import sys
import uvicorn

def run_dev():
    """Run the backend in development mode with CORS allowing localhost connections"""
    print("Starting development server...")
    # Update main.py to allow localhost CORS
    update_cors(["http://localhost:5500", "http://127.0.0.1:5500"])
    os.chdir("Backend")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

def run_prod():
    """Run the backend in production mode with CORS allowing GitHub Pages"""
    print("Starting production server...")
    # Update main.py to allow your GitHub Pages domain
    update_cors(["https://bryanlandsy.github.io"])
    os.chdir("Backend")
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))

def update_cors(origins):
    """Update CORS settings in main.py"""
    with open("Backend/main.py", "r") as file:
        content = file.read()
    
    # Replace the CORS origins line
    import re
    updated_content = re.sub(
        r'allow_origins=\[".*?"\]',  # Match the current allow_origins setting
        f'allow_origins={origins}',  # Replace with new origins
        content
    )
    
    with open("Backend/main.py", "w") as file:
        file.write(updated_content)
    
    print(f"Updated CORS settings to allow origins: {origins}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "prod":
        run_prod()
    else:
        run_dev()
