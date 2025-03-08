import random

#random.seed(0)

score = 0
lives = 3

def assertEqual(result, expected):
    global score, lives
    if (result == expected):
        score += 100
        print("Correct!")
        print(f"Score: {score}")
        return True
    score -= 50
    lives -= 1
    print("WRONG")
    print(f"Score: {score}")
    print(f"Lives: {lives}")
    if (lives == 0):
        print("Game Over")
    return False


def generate_answer_options(a, b):
    correct_answer = a * b
    options = set()

    while len(options) < 3:
        random_a = random.choice([max(1, a - 1), min(10, a + 1)])
        random_b = random.choice([max(1, b - 1), min(10, b + 1)])
        option = random_a * random_b
        if option != correct_answer:
            options.add(option)

    options = list(options)
    options.append(correct_answer)
    random.shuffle(options)

    options_dict = {}
    options_dict["A"] = options[0]
    options_dict["B"] = options[1]
    options_dict["C"] = options[2]
    options_dict["D"] = options[3]

    return options_dict

def multiplication_table_question():
    a, b = random.randrange(1, 11), random.randrange(1, 11)
    options = generate_answer_options(a, b)
    print(f"{a} * {b} = ?")
    print(options)
    value = input("Type A, B, C or D (lowercase works)\n")
    value = value.upper()
    res = options[value]
    exp = a * b
    assertEqual(res, exp)



while lives > 0:
    multiplication_table_question()

