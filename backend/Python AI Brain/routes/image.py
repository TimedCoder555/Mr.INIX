from flask import Blueprint, request, jsonify

image_bp = Blueprint(
    "image",
    __name__
)


@image_bp.route("/image", methods=["POST"])
def process_image():

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error": "No image uploaded"
            }), 400

        image = request.files["image"]

        return jsonify({
            "success": True,
            "filename": image.filename,
            "message": "Image received successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500