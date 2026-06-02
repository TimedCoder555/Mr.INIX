from datetime import datetime
import uuid


def get_timestamp():

    return datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


def generate_id():

    return str(uuid.uuid4())


def clean_text(text):

    if not text:
        return ""

    return text.strip()


def success_response(data):

    return {
        "success": True,
        "data": data
    }


def error_response(message):

    return {
        "success": False,
        "error": message
    }