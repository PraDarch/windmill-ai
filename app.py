from flask import Flask, render_template, request, jsonify, redirect, session
from sklearn.tree import DecisionTreeClassifier
import numpy as np

app = Flask(__name__)
app.secret_key = "secret123"

# Dummy login
USER = "admin"
PASS = "1234"
# ---------------- ML MODEL ----------------

# Features: [wind, terrain_code, budget]
X = [
    [5, 0, 40000],
    [10, 1, 100000],
    [15, 1, 150000],
    [8, 0, 50000],
    [12, 2, 80000],
    [20, 1, 200000],
    [7, 3, 60000],
    [14, 2, 120000]
]

# Labels: 0 = Vortex, 1 = Traditional
y = [0, 1, 1, 0, 1, 1, 0, 1]

model = DecisionTreeClassifier()
model.fit(X, y)

def terrain_to_number(t):
    return {"Urban":0, "Coastal":1, "Rural":2, "Hilly":3}[t]

@app.route('/home')
def home_page():
    return render_template("home.html")

@app.route('/')
def login():
    return render_template("login.html")

@app.route('/login', methods=['POST'])
def do_login():
    username = request.form['username']
    password = request.form['password']

    if username == USER and password == PASS:
        session['user'] = username
        return redirect('/home')
    return "Invalid Login"

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect('/')
    return render_template("dashboard.html")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    wind = int(data['wind'])
    terrain = data['terrain']
    budget = int(data['budget'])

    vortex_output = wind * 1.5
    traditional_output = wind * 3

    # Scores
    if terrain == "Urban":
        v_score, t_score = 9, 5
    elif terrain == "Coastal":
        v_score, t_score = 7, 10
    elif terrain == "Rural":
        v_score, t_score = 8, 9
    else:
        v_score, t_score = 7, 8

    if budget < 60000:
        v_score += 2
    elif budget > 120000:
        t_score += 2

    terrain_code = terrain_to_number(terrain)

    prediction = model.predict([[wind, terrain_code, budget]])[0]

    recommendation = "Vortex" if prediction == 0 else "Traditional"

    return jsonify({
        "vortex_output": vortex_output,
        "traditional_output": traditional_output,
        "recommendation": recommendation
    })

app.run(debug=True)