from app.core.security import PASSWORD_HASH_PREFIX
from app.crud.user import get_user_by_email


def test_registered_user_can_sign_in(client, db):
    registration_response = client.post(
        "/api/v1/users/",
        json={
            "username": "New Member",
            "email": "new.member@example.com",
            "password": "secure-password",
            "avatar_url": "",
        },
    )

    assert registration_response.status_code == 201
    registered_user = registration_response.json()
    assert registered_user["username"] == "New Member"
    assert registered_user["email"] == "new.member@example.com"
    assert "password" not in registered_user
    assert "password_hash" not in registered_user

    stored_user = get_user_by_email(db, "new.member@example.com")
    assert stored_user is not None
    assert stored_user.password_hash != "secure-password"
    assert stored_user.password_hash.startswith(f"{PASSWORD_HASH_PREFIX}$")

    login_response = client.post(
        "/api/v1/users/login",
        json={
            "email": "new.member@example.com",
            "password": "secure-password",
        },
    )

    assert login_response.status_code == 200
    assert login_response.json()["id"] == registered_user["id"]


def test_login_rejects_incorrect_password(client):
    client.post(
        "/api/v1/users/",
        json={
            "username": "New Member",
            "email": "new.member@example.com",
            "password": "secure-password",
        },
    )

    response = client.post(
        "/api/v1/users/login",
        json={
            "email": "new.member@example.com",
            "password": "incorrect-password",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_login_upgrades_legacy_demo_password(client, db):
    registration_response = client.post(
        "/api/v1/users/",
        json={
            "username": "Temporary Member",
            "email": "legacy@example.com",
            "password": "temporary-password",
        },
    )
    assert registration_response.status_code == 201

    legacy_user = get_user_by_email(db, "legacy@example.com")
    legacy_user.password_hash = "password123"
    db.commit()

    response = client.post(
        "/api/v1/users/login",
        json={
            "email": "legacy@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200
    db.refresh(legacy_user)
    assert legacy_user.password_hash.startswith(f"{PASSWORD_HASH_PREFIX}$")


def test_sixian_demo_email_alias_supports_existing_database(client):
    registration_response = client.post(
        "/api/v1/users/",
        json={
            "username": "Sixian",
            "email": "sixian.demo@example.com",
            "password": "password123",
        },
    )
    assert registration_response.status_code == 201

    response = client.post(
        "/api/v1/users/login",
        json={
            "email": "sixian@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == "sixian.demo@example.com"
