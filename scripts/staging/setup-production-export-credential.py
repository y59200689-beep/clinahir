"""Private local handoff only. No network access or production changes."""
import getpass
import json
import os
from pathlib import Path

REF = "jsagrvxgydvhdoxibzny"
ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "output/production/export-credential.json"

def main():
    os.umask(0o077)
    if not os.isatty(0):
        raise SystemExit("Open the .command launcher in Terminal; interactive input is required.")
    print("Clinahir production backup: existing PostgreSQL credential only.")
    print("Project: " + REF)
    print("Do not reset a password or create a new database role for this step.")
    print("This tool stores input locally; it does not connect to the database.")
    if DEST.exists() and input("Replace the saved local credential? Type yes: ").strip() != "yes":
        raise SystemExit("Saved credential left unchanged.")
    host = input("Database host from the project's Connect panel: ").strip()
    direct = "db." + REF + ".supabase.co"
    import re
    if host != direct and not re.fullmatch(r"[a-z0-9-]+\.pooler\.supabase\.com", host):
        raise SystemExit("Unsupported host. Use this project's direct or Supabase pooler host.")
    port = input("Session connection port [5432]: ").strip() or "5432"
    if port != "5432":
        raise SystemExit("Use the session connection on port 5432 for this backup.")
    user = input("Existing database username (including project suffix for pooler): ").strip()
    if not user or not re.fullmatch(r"[a-zA-Z0-9_.-]+", user):
        raise SystemExit("Invalid username.")
    if host != direct and not user.endswith("." + REF):
        raise SystemExit("Pooler username must identify the exact production project.")
    password = getpass.getpass("Existing database password (hidden): ")
    if not password or password != getpass.getpass("Confirm password (hidden): "):
        raise SystemExit("Empty or mismatched password; nothing saved.")
    DEST.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(DEST.parent, 0o700)
    import tempfile
    fd, temporary = tempfile.mkstemp(prefix=".credential-", dir=DEST.parent)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        os.fchmod(handle.fileno(), 0o600)
        json.dump({"projectRef": REF, "host": host, "port": 5432,
                   "database": "postgres", "user": user, "password": password,
                   "sslmode": "verify-full"}, handle)
        handle.write("\n")
    os.replace(temporary, DEST)
    print("Credential saved privately. Return to Codex and say: private setup done.")
    print("No connection test, export, upload, or production change has occurred.")

if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nCancelled.")
    input("Press Return to close.")
