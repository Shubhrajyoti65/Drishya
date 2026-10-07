from pathlib import Path

# Redirect to ai-service/scripts/ingest.py
ai_service_script = Path(__file__).resolve().parent.parent / "ai-service" / "scripts" / "ingest.py"
if ai_service_script.exists():
    import runpy
    runpy.run_path(str(ai_service_script), run_name="__main__")
else:
    print("Error: ai-service/scripts/ingest.py not found.")
