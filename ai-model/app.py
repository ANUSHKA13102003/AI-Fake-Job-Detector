from flask import Flask, request, jsonify
from flask_cors import CORS
from model import analyze_job_text

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "AI Fake Job Detector"})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data['text']
    if len(text.strip()) < 10:
        return jsonify({"error": "Text too short for analysis"}), 400

    result = analyze_job_text(text)
    return jsonify(result)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)