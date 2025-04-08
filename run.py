import os
import sys

# Add the Backend directory to the Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'Backend')
sys.path.insert(0, backend_dir)

# Import and run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("Backend.main:app", host="127.0.0.1", port=8000, reload=True)
