# Multiplication Table Game

This is a personal project for [Boot.dev](https://boot.dev). I have used React with NextJS framework for frontend, and Flask for backend. All the queries are being sent to a locally hosted MySQL database.

## Setup

1. Clone the app
2. In terminal 1, go to `backend` folder (`cd backend`)
3. Activate the virtual environment to install dependencies locally:
```
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```
4. Run the Flask server with `python3 app.py`
5. In terminal 2, go to `frontend` folder (`cd frontend`)
6. Install dependencies (I used `yarn`)
7. Run the frontend with `yarn dev` (or `npx dev`)
8. Add `.env` configuration files:

>In order for the project to work locally the `/backend/.env` file should have the following fields:
>  ```
>  DB_USER="your_user"
>  DB_PASSWORD="your_password"
>  DB_NAME="your_table_name"
>  ```
>
>And `/frontend/.env.local` should have these fields:
>  ```
>  AUTH_SECRET="your_secret" # Added by `npx auth`. Read more: https://cli.authjs.dev
>  AUTH_GITHUB_ID="your_id"
>  AUTH_GITHUB_SECRET="your_secret2"
>  ```
>
>In order to generate `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` you need to make your own OAuth application in the developer console on GitHub, there are plenty of guides out there, just google it.

9. You should be able to access the website via going to `https://localhost:3000`

The table schema looks something like this:
```
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL
);

CREATE TABLE scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE personal_bests (
    best_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    best_score INT NOT NULL,
    achieved_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

TODO:
- Add a leaderboard (the database supports it, just not implemented)
- Make the game more responsive, I added prefetching but it still lags, perhaps move the assertion logic to the frontend instead of making a request each time you answer
  (this opens up more possibility for cheating? haven't thought about it yet)
- Make the website better looking (better styling, responsive design, animations(?), sfx(?)
