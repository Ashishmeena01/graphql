import hmac, hashlib, base64, json



def verify_jwt(token: str, secret: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Malformed JWT")

    header_b64, payload_b64, sig_b64 = parts

    # Step 1–2: signing input is just the two encoded segments joined by "."
    signing_input = f"{header_b64}.{payload_b64}".encode()

    # Step 3: recompute signature
    expected_sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()

    # Decode the provided signature from base64url
    provided_sig = base64.urlsafe_b64decode(sig_b64 + "==")

    # Step 4: constant-time comparison
    if not hmac.compare_digest(expected_sig, provided_sig):
        raise PermissionError("Signature mismatch — token has been tampered with")

    # Only decode payload AFTER verification passes
    payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "=="))
    return payload


# a = verify_jwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiaiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30","a-string-secret-at-least-256-bits-long")


print(hashlib.sha256(b'ashish'))
print(hashlib.sha256(b'ashism'))