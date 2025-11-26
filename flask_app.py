import os
import markdown
from flask import Flask, render_template, abort

app = Flask(__name__)

# --- HELPER FUNCTIONS ---


def get_post(slug):
    """Reads a markdown file and returns metadata + HTML content."""
    try:
        with open(f"posts/{slug}.md", "r") as f:
            content = f.read()
            parts = content.split("---", 2)
            if len(parts) == 3:
                meta_lines = parts[1].strip().split("\n")
                metadata = {}
                for line in meta_lines:
                    if ":" in line:
                        key, value = line.split(":", 1)
                        metadata[key.strip()] = value.strip()

                body = parts[2]
                html_content = markdown.markdown(body, extensions=["footnotes"])
                return metadata, html_content
    except FileNotFoundError:
        pass
    return None, None


def get_all_posts():
    """Returns a list of all post metadata, sorted by date."""
    posts = []
    if not os.path.exists("posts"):
        return posts

    for filename in os.listdir("posts"):
        if filename.endswith(".md"):
            slug = filename[:-3]
            metadata, _ = get_post(slug)
            if metadata:
                metadata["slug"] = slug
                posts.append(metadata)

    # Sort by date (newest first)
    posts.sort(key=lambda x: x.get("date", ""), reverse=True)
    return posts


# --- ROUTES ---


@app.route("/")
def index():
    # Fetch posts to display on the homepage
    posts = get_all_posts()

    # Pass 'posts' to your existing index.html
    return render_template("index.html", posts=posts)


@app.route("/post/<slug>")
def post(slug):
    metadata, content = get_post(slug)
    if not metadata:
        abort(404)
    return render_template(
        "post.html",
        title=metadata.get("title"),
        content=content,
        date=metadata.get("date"),
    )


@app.route("/squeaker")
def squeaker():
    return render_template("squeaker.html")


if __name__ == "__main__":
    app.run(debug=True)
