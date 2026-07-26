import base64
import binascii
import hashlib
import hmac
import secrets


PASSWORD_HASH_NAME = "sha256"
PASSWORD_HASH_ITERATIONS = 600_000
PASSWORD_HASH_PREFIX = "pbkdf2_sha256"


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        PASSWORD_HASH_NAME,
        password.encode("utf-8"),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )

    encoded_salt = base64.urlsafe_b64encode(salt).decode("ascii")
    encoded_digest = base64.urlsafe_b64encode(digest).decode("ascii")
    return (
        f"{PASSWORD_HASH_PREFIX}${PASSWORD_HASH_ITERATIONS}"
        f"${encoded_salt}${encoded_digest}"
    )


def verify_password(password: str, stored_password: str) -> bool:
    if not stored_password.startswith(f"{PASSWORD_HASH_PREFIX}$"):
        # Existing demo users were originally seeded with a plain-text password.
        # Accept it once so the login endpoint can transparently upgrade the hash.
        return hmac.compare_digest(password, stored_password)

    try:
        _, iterations_value, encoded_salt, encoded_digest = stored_password.split(
            "$",
            maxsplit=3,
        )
        iterations = int(iterations_value)
        salt = base64.urlsafe_b64decode(encoded_salt.encode("ascii"))
        expected_digest = base64.urlsafe_b64decode(encoded_digest.encode("ascii"))
    except (binascii.Error, TypeError, ValueError):
        return False

    actual_digest = hashlib.pbkdf2_hmac(
        PASSWORD_HASH_NAME,
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(actual_digest, expected_digest)


def password_needs_upgrade(stored_password: str) -> bool:
    return not stored_password.startswith(f"{PASSWORD_HASH_PREFIX}$")
