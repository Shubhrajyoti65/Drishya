import sys
from pathlib import Path

# Add ai-service to path
service_root = Path(__file__).resolve().parent.parent / "ai-service"
if str(service_root) not in sys.path:
    sys.path.insert(0, str(service_root))

from tests.test_rag import *
