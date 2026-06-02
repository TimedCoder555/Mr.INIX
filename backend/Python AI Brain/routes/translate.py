from flask import Blueprint, request, jsonify

translate_bp = Blueprint(
    "translate",
    __name__
)


@translate_bp.route("/translate", methods=["POST"])
def translate():

    try:

        data = request.get_json()

        text = data.get("text", "")
        target_language = data.get(
            "target_language",
            "en"
        )

        if not text.strip():

            return jsonify({
                "success": False,
                "error": "Text is empty"
            }), 400

        return jsonify({
            "success": True,
            "original_text": text,
            "translated_text": text,
            "target_language": target_language,
            "message": "Translation system ready"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500