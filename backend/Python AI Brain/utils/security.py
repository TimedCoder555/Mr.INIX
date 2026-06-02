import hashlib


def hash_text(text):

    return hashlib.sha256(
        text.encode()
    ).hexdigest()


def verify_text(text, hashed):

    return (
        hashlib.sha256(
            text.encode()
        ).hexdigest()
        == hashed
    )


def sanitize_input(text):

    dangerous = [
        "<script>",
        "</script>",
        "javascript:"
    ]

    for item in dangerous:
        text = text.replace(
            item,
            ""
        )

    return text