"""A simple Flask app for serving my website, http://benvelie.com"""

from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello from Flask!"
