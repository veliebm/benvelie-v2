"""A simple Flask app for serving my website, http://benvelie.com"""

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/squeaker")
def squeaker():
    return render_template("squeaker.html")


if __name__ == "__main__":
    app.run(debug=True)
