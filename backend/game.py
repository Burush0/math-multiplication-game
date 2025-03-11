import random

#random.seed(0)

def assertEqual(result, expected):
    if (result == expected):
        return True
    return False


def generate_question_and_options():
    a, b = random.randrange(1, 11), random.randrange(1, 11)
    question = f"{a} * {b} = ?"
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

    return question, options_dict, a, b

def calc_result_and_assert(options, a, b, answer):
    value = answer.upper()
    res = options[value]
    exp = a * b
    return assertEqual(res, exp)


'''
def multiplication_table_question():
    question, options = generate_question_and_options()
    print(question)
    print(options)
    value = input("Type A, B, C or D (lowercase works)\n")
    value = value.upper()
    res = options[value]
    exp = a * b
    assertEqual(res, exp)



while lives > 0:
    multiplication_table_question()
'''
