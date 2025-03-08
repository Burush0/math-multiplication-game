from flask import Flask, request, jsonify
from flask_cors import CORS

# app instance
app = Flask(__name__)
CORS(app)

@app.route('/api/submit', methods=['POST'])
def handle_submission():
    data = request.json
    print("Received data:", data)

    response = {"status": "success", 
                "message": "Data received"}
    return jsonify(response)

@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': 'Hello world!',
        'people': ['John', 'Elden', 'Ring']
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)