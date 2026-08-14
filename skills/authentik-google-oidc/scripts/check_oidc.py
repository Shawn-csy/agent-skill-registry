#!/usr/bin/env python3
"""Read-only health and OIDC discovery checks with redacted output."""

from __future__ import annotations

import argparse
import json
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

try:
    import certifi
except ImportError:  # Use the operating system trust store when certifi is unavailable.
    certifi = None


TLS_CONTEXT = ssl.create_default_context(cafile=certifi.where() if certifi else None)


REQUIRED_DISCOVERY_FIELDS = (
    "issuer",
    "authorization_endpoint",
    "token_endpoint",
    "jwks_uri",
)


def fetch(url: str, *, expect_json: bool) -> tuple[int, object | None]:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json" if expect_json else "*/*",
            "User-Agent": "shawnup-authentik-oidc-check/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=15, context=TLS_CONTEXT) as response:
        body = response.read(1_000_000)
        if expect_json:
            return response.status, json.loads(body)
        return response.status, None


def normalize_issuer(value: str) -> str:
    return value if value.endswith("/") else value + "/"


def validate_https(url: str, label: str) -> list[str]:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme == "https":
        return []
    if parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1", "::1"}:
        return []
    return [f"{label} must use HTTPS (except localhost): {url}"]


def check_health(url: str) -> list[str]:
    errors = validate_https(url, "health URL")
    if errors:
        return errors
    try:
        status, _ = fetch(url, expect_json=False)
    except (urllib.error.URLError, TimeoutError) as exc:
        return [f"health request failed: {exc}"]
    if not 200 <= status < 300:
        return [f"health endpoint returned HTTP {status}"]
    print(f"OK health {url} -> HTTP {status}")
    return []


def check_issuer(raw_issuer: str) -> list[str]:
    issuer = normalize_issuer(raw_issuer)
    errors = validate_https(issuer, "issuer")
    if errors:
        return errors

    discovery_url = issuer + ".well-known/openid-configuration"
    try:
        status, payload = fetch(discovery_url, expect_json=True)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return [f"discovery request failed: {exc}"]

    if status != 200 or not isinstance(payload, dict):
        return [f"discovery endpoint returned invalid response (HTTP {status})"]

    missing = [field for field in REQUIRED_DISCOVERY_FIELDS if not payload.get(field)]
    if missing:
        errors.append("missing discovery fields: " + ", ".join(missing))

    discovered_issuer = payload.get("issuer")
    if discovered_issuer != issuer:
        errors.append(
            f"issuer mismatch: configured {issuer!r}, discovery returned {discovered_issuer!r}"
        )

    issuer_host = urllib.parse.urlparse(issuer).hostname
    for field in ("authorization_endpoint", "token_endpoint", "jwks_uri"):
        value = payload.get(field)
        if not isinstance(value, str):
            continue
        errors.extend(validate_https(value, field))
        if urllib.parse.urlparse(value).hostname != issuer_host:
            errors.append(f"{field} uses a different host: {value}")

    grants = payload.get("grant_types_supported", [])
    if "authorization_code" not in grants:
        errors.append("discovery does not advertise the authorization_code grant")

    pkce_methods = payload.get("code_challenge_methods_supported", [])
    if "S256" not in pkce_methods:
        errors.append("discovery does not advertise PKCE S256")

    signing_algorithms = payload.get("id_token_signing_alg_values_supported", [])
    if not any(str(algorithm).startswith(("RS", "ES", "PS")) for algorithm in signing_algorithms):
        errors.append("discovery does not advertise an asymmetric ID-token signing algorithm")

    keys: list[object] = []
    jwks_uri = payload.get("jwks_uri")
    if isinstance(jwks_uri, str):
        try:
            jwks_status, jwks = fetch(jwks_uri, expect_json=True)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            errors.append(f"JWKS request failed: {exc}")
        else:
            keys = jwks.get("keys", []) if isinstance(jwks, dict) else []
            if jwks_status != 200 or not keys:
                errors.append(f"JWKS endpoint returned no keys (HTTP {jwks_status})")
    else:
        errors.append("jwks_uri is not a URL string")

    if not errors:
        print(f"OK discovery {discovery_url} -> HTTP {status}")
        for field in REQUIRED_DISCOVERY_FIELDS:
            print(f"OK {field}: {payload[field]}")
        print(f"OK JWKS: {len(keys)} public key(s)")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check an OIDC discovery document and/or service health endpoint."
    )
    parser.add_argument("--issuer", help="Expected OIDC issuer URL")
    parser.add_argument("--health-url", help="Optional readiness/liveness URL")
    args = parser.parse_args()

    if not args.issuer and not args.health_url:
        parser.error("provide --issuer, --health-url, or both")

    errors: list[str] = []
    if args.health_url:
        errors.extend(check_health(args.health_url))
    if args.issuer:
        errors.extend(check_issuer(args.issuer))

    for error in errors:
        print(f"ERROR {error}", file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
