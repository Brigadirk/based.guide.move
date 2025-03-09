import sys
import uvicorn
import traceback

try:
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=False)
except Exception as e:
    print("Error starting server:", file=sys.stderr)
    traceback.print_exc()
    sys.exit(1) 