import os

from waitress import serve

from production import app


def main():
    host = os.environ.get("WIFIX_HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", os.environ.get("WIFIX_PORT", "5000")))
    threads = int(os.environ.get("WIFIX_THREADS", "100"))
    print(f"Starting WifiX backend on http://{host}:{port}")
    serve(app, host=host, port=port, threads=threads)


if __name__ == "__main__":
    main()
