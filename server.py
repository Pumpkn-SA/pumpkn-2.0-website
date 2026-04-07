#!/usr/bin/env python3
import http.server
import os
import urllib.parse

PORT = 3001
SITE_DIR = os.path.dirname(os.path.abspath(__file__))

ROUTES = {
    '/': '/index.html',
    '/about-us/why-we-are': '/about-us/why-we-are.html',
    '/info-hub/case-studies': '/info-hub/case-studies.html',
    '/info-hub/articles': '/info-hub/articles.html',
    '/info-hub/careers': '/info-hub/careers.html',
    '/info-hub/faqs': '/info-hub/faqs.html',
    '/contact-us': '/contact-us/index.html',
    '/support': '/support/index.html',
    '/privacy-policy': '/privacy-policy/index.html',
    '/terms-conditions': '/terms-conditions/index.html',
    '/v2': '/index-v2-slim.html',
    '/advisor': '/advisor.html',
    '/advisor-a': '/advisor-a.html',
    '/advisor-b': '/advisor-b.html',
    '/advisor-c': '/advisor-c.html',
}

class PumpknHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)

        # Check route mapping
        if path in ROUTES:
            self.path = ROUTES[path]
        elif path.endswith('/') and path.rstrip('/') in ROUTES:
            self.path = ROUTES[path.rstrip('/')]

        return super().do_GET()

if __name__ == '__main__':
    with http.server.HTTPServer(('', PORT), PumpknHandler) as httpd:
        print(f"Pumpkn site running at http://localhost:{PORT}")
        httpd.serve_forever()
