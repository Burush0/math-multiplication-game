import os
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, 
    set_access_cookies, 
    JWTManager, 
    jwt_required, 
    get_jwt_identity,
    unset_jwt_cookies
    )
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv

load_dotenv()

# app instance
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

jwt_secret_key = os.environ['JWT_SECRET_KEY']

app.config['JWT_SECRET_KEY'] = jwt_secret_key
app.config['JWT_TOKEN_LOCATION'] = ['cookies']

jwt = JWTManager(app)

db_user = os.environ['DB_USER']
db_pass = os.environ['DB_PASSWORD']
db_name = os.environ['DB_NAME']

db = mysql.connector.connect(
    host="localhost",
    user=db_user,
    password=db_pass,
    database=db_name
)


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    cursor = db.cursor()
    cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                   (username, email, password_hash))
    db.commit()

    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user and bcrypt.check_password_hash(user['password_hash'], password):
        access_token = create_access_token(identity=user['id'])
        response = jsonify({"message": "Login successful"})
        set_access_cookies(response, access_token)
        return response, 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/google-auth', methods=['POST'])
def google_auth():
    data = request.get_json()
    token = data['token']

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), 'your-google-client-id')

        google_id = idinfo['sub']
        email = idinfo['email']

        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE google_id = %s", (google_id,))
        user = cursor.fetchone()

        if not user:
            cursor.execute("INSERT INTO users (email, google_id) VALUES (%s, %s)", (email, google_id))
            db.commit()
            user_id = cursor.lastrowid
        else:
            user_id = user['id']

        access_token = create_access_token(identity=user_id)
        response = jsonify({"message": "Login successful"})
        set_access_cookies(response, access_token)
        return response, 200

    except ValueError:
        return jsonify({"message": "Invalid token"}), 401

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200

@app.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200

if __name__ == "__main__":
    app.run(debug=True, port=8080)
'''
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
'''