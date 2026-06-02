from flask import Blueprint, request, jsonify

voice_bp = Blueprint(
    "voice",
    __name__
)


@voice_bp.route("/voice", methods=["POST"])
def process_voice():

    try:

        if "audio" not in request.files:

            return jsonify({
                "success": False,
                "error": "No audio file uploaded"
            }), 400

        audio = request.files["audio"]

        return jsonify({
            "success": True,
            "filename": audio.filename,
            "message": "Voice received successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500