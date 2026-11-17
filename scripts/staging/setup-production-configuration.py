"""Local private configuration handoff. Does not transmit or change production."""
import getpass
import json
import os
import re
import tempfile
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "output/production/runtime-configuration.json"

def main():
    os.umask(0o077)
    if not os.isatty(0):
        raise SystemExit("Run the launcher in Terminal.")
    print("Clinahir: private production configuration preparation")
    print("No connection, account creation, credential reset or hosting update occurs here.")
    print("Use existing values where available. Leave unavailable values blank; do not invent replacements.")
    if DEST.exists() and input("Replace the saved local setup? Type yes: ").strip() != "yes":
        raise SystemExit("Existing setup left unchanged.")
    email = input("Chosen production owner email: ").strip()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise SystemExit("A valid owner email is required.")
    print("Production currently has no Auth users; the chosen account needs separate approved creation and private MFA enrollment.")
    service = getpass.getpass("Existing production Supabase service-role/secret API key (hidden): ").strip()
    cron = getpass.getpass("Existing Vercel production CRON_SECRET, or Return if unavailable (hidden): ").strip()
    origin = input("Existing live Daily Command HTTPS origin, or Return if unavailable: ").strip()
    if origin:
        u = urlparse(origin)
        if u.scheme != "https" or not u.hostname or u.username or u.password or u.path not in ("", "/") or u.query or u.fragment:
            raise SystemExit("Use only the HTTPS origin, without a path, credentials or query.")
        origin = "https://" + u.netloc
    integration = getpass.getpass("Existing shared CLINAHIR_INTEGRATION_SECRET, or Return if unavailable (hidden): ").strip()
    recipient = input("Existing Daily Command destination owner UUID, or Return if unavailable: ").strip()
    if recipient and not re.fullmatch(r"[a-fA-F0-9-]{36}", recipient):
        raise SystemExit("Destination owner must be its existing UUID.")
    data = {"projectRef":"jsagrvxgydvhdoxibzny","CLINAHIR_ENV":"production","VITE_APP_ENV":"production",
        "VITE_SENTRY_ENABLED":"false","CLINAHIR_PRODUCTION_SUPABASE_REF":"jsagrvxgydvhdoxibzny",
        "SUPABASE_URL":"https://jsagrvxgydvhdoxibzny.supabase.co","SUPABASE_SERVICE_ROLE_KEY":service,
        "CLINAHIR_ADMIN_EMAIL":email,"CLINAHIR_ADMIN_USER_ID":"","CLINAHIR_ADMIN_MFA_REQUIRED":"true",
        "CRON_SECRET":cron,"CLINAHIR_PRODUCTION_ORIGIN":"https://clinahir.tech",
        "CLINAHIR_PRODUCTION_CRM_ORIGIN":origin,"DAILY_COMMAND_URL":origin,
        "CLINAHIR_INTEGRATION_SECRET":integration,"CLINAHIR_LEADS_USER_ID":recipient,"WHATSAPP_ENABLED":"false"}
    DEST.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, temporary = tempfile.mkstemp(prefix=".runtime-", dir=DEST.parent)
    with os.fdopen(fd,"w") as handle:
        os.fchmod(handle.fileno(),0o600)
        json.dump(data,handle)
        handle.write("\n")
    os.replace(temporary,DEST)
    print("Private setup saved. Return to Codex and say: production configuration saved.")
    print("Blank values remain unresolved; no production changes have occurred.")

if __name__ == "__main__":
    try:
        main()
    except (EOFError,KeyboardInterrupt):
        print("\nCancelled.")
    input("Press Return to close.")
