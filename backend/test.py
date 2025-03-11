from flask import Flask, jsonify, request
from flask_cors import CORS
from game import generate_question_and_options, calc_result_and_assert

app = Flask(__name__)
CORS(app)

score = 0
lives = 3
current_question = ""
current_options = {}
a = 0
b = 0

# GET request to retrieve question and options
@app.route('/api/get-question', methods=['GET'])
def get_question():
    global score, lives, current_question, current_options, a, b
    current_question, current_options, a, b = generate_question_and_options()
    return jsonify({
        "question": current_question,
        "options": current_options,
        "score": score,
        "lives": lives
    })

# POST request to receive a string from the client
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    global score, lives, current_question, current_options, a, b
    data = request.json
    answer = data.get("answer")

    # Evaluate the current question
    if calc_result_and_assert(current_options, a, b, answer):
        score += 100
        received_answer = "correct!"
    else:
        lives -= 1
        received_answer = "incorrect!"

    # Generate a new question for the next round
    current_question, current_options, a, b = generate_question_and_options()

    # Check if the game is over
    if lives == 0:
        return jsonify({
            "status": "success",
            "received_answer": "you died",
            "score": score,
            "lives": lives
        })

    return jsonify({
        "status": "success",
        "received_answer": received_answer,
        "score": score,
        "lives": lives,
        "next_question": current_question,  # Send the next question to the frontend
        "next_options": current_options     # Send the next options to the frontend
    })

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    global score, lives, current_question, current_options, a, b
    score = 0
    lives = 3
    current_question, current_options, a, b = generate_question_and_options()
    return jsonify({
        "question": current_question,
        "options": current_options,
        "score": score,
        "lives": lives,
        "status": "success",
        "received_answer": "game state reset",
    })


if __name__ == '__main__':
    app.run(debug=True, port=8080)