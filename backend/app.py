import os
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from game import generate_question_and_options, calc_result_and_assert

load_dotenv()

app = Flask(__name__)
CORS(app)

db_config = {
    "host": "localhost",
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

class GameState:
    def __init__(self):
        self.score = 0
        self.lives = 3
        self.current_question = ""
        self.current_options = {}
        self.a = 0
        self.b = 0

    def reset(self):
        self.score = 0
        self.lives = 3
        self.current_question, self.current_options, self.a, self.b = generate_question_and_options()

    def generate_new_question(self):
        self.current_question, self.current_options, self.a, self.b = generate_question_and_options()

game_state = GameState()

@app.route('/api/get-question', methods=['GET'])
def get_question():
    game_state.generate_new_question()
    return jsonify({
        "question": game_state.current_question,
        "options": game_state.current_options,
        "score": game_state.score,
        "lives": game_state.lives
    })

@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    data = request.json
    answer = data.get("answer")

    if calc_result_and_assert(game_state.current_options, game_state.a, game_state.b, answer):
        game_state.score += 100
        received_answer = "correct!"
    else:
        game_state.lives -= 1
        received_answer = "incorrect!"

    if game_state.lives == 0:
        return jsonify({
            "status": "success",
            "received_answer": "you died",
            "score": game_state.score,
            "lives": game_state.lives
        })

    game_state.generate_new_question()

    return jsonify({
        "status": "success",
        "received_answer": received_answer,
        "score": game_state.score,
        "lives": game_state.lives,
        "next_question": game_state.current_question,
        "next_options": game_state.current_options
    })

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    game_state.reset()
    return jsonify({
        "question": game_state.current_question,
        "options": game_state.current_options,
        "score": game_state.score,
        "lives": game_state.lives,
        "status": "success",
        "received_answer": "game state reset",
    })

@app.route('/api/save-score', methods=['POST'])
def save_score():
    data = request.get_json()
    username = data.get('username')
    score = data.get('score')

    if not username or not score:
        return jsonify({'error': 'Username and score are required'}), 400

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            cursor.execute(
                "INSERT INTO users (username, created_at) VALUES (%s, %s)",
                (username, datetime.now(timezone.utc))
            )
            db.commit()
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()

        user_id = user['user_id']

        cursor.execute(
            "INSERT INTO scores (user_id, score, created_at) VALUES (%s, %s, %s)",
            (user_id, score, datetime.now(timezone.utc))
        )

        cursor.execute(
            "SELECT best_score FROM personal_bests WHERE user_id = %s",
            (user_id,)
        )
        personal_best = cursor.fetchone()

        if personal_best:
            if score > personal_best['best_score']:
                cursor.execute(
                    "UPDATE personal_bests SET best_score = %s, achieved_at = %s WHERE user_id = %s",
                    (score, datetime.now(timezone.utc), user_id)
                )
        else:
            cursor.execute(
                "INSERT INTO personal_bests (user_id, best_score, achieved_at) VALUES (%s, %s, %s)",
                (user_id, score, datetime.now(timezone.utc))
            )

        db.commit()

        return jsonify({'message': 'Score saved successfully'}), 200

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({'error': 'Database error'}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
            
@app.route('/api/get-personal-best', methods=['GET'])
def get_personal_best():
    username = request.args.get('username')

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_id = user['user_id']

        cursor.execute(
            "SELECT best_score, achieved_at FROM personal_bests WHERE user_id = %s",
            (user_id,)
        )
        personal_best = cursor.fetchone()

        if not personal_best:
            return jsonify({'message': 'No personal best found'}), 200

        return jsonify({
            'best_score': personal_best['best_score'],
            'achieved_at': personal_best['achieved_at']
        }), 200

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({'error': 'Database error'}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

@app.route('/api/get-scores', methods=['GET'])
def get_scores():
    username = request.args.get('username')
    time_range = request.args.get('time_range', 'lifetime')

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_id = user['user_id']

        now = datetime.now(timezone.utc)
        if time_range == 'today':
            start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_range == 'last_3_days':
            start_time = now - timedelta(days=3)
        elif time_range == 'last_week':
            start_time = now - timedelta(weeks=1)
        elif time_range == 'last_month':
            start_time = now - timedelta(days=30)
        elif time_range == 'last_year':
            start_time = now - timedelta(days=365)
        else:
            start_time = datetime.min.replace(tzinfo=timezone.utc)

        cursor.execute(
            "SELECT score, created_at FROM scores WHERE user_id = %s AND created_at >= %s ORDER BY created_at",
            (user_id, start_time)
        )
        scores = cursor.fetchall()

        return jsonify(scores), 200

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({'error': 'Database error'}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

if __name__ == "__main__":
    app.run(debug=True, port=8080)