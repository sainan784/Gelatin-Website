Deployment options

1) Local Docker (recommended quick test)

# build
docker build -t gelatin-site:latest .
# run
docker run -p 8000:8000 gelatin-site:latest
# then open http://localhost:8000

2) Deploy to Render (GitHub repo required)
- Push repo to GitHub
- Create a new Web Service in Render
- Use build command: pip install -r requirements.txt
- Start command: gunicorn app:app --bind 0.0.0.0:$PORT --workers 3

3) Deploy to a VPS (manual)
- See earlier instructions in the main README

Notes:
- The app runs with Gunicorn on port 8000 inside the container.
- If you use a cloud provider, configure the port mapping and environment variables as needed.
