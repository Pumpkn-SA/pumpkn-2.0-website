#!/usr/bin/env python3
import os
import re
import urllib.parse

SITE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(SITE_DIR, 'images')

# Get local image files
local_images = os.listdir(IMAGES_DIR)

def find_local_image(cdn_filename):
    decoded = urllib.parse.unquote(cdn_filename)
    if decoded in local_images:
        return decoded
    for local in local_images:
        if local == decoded or decoded in local or local in decoded:
            return local
    return None

def find_html_files(directory):
    results = []
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d != 'node_modules']
        for f in files:
            if f.endswith('.html'):
                results.append(os.path.join(root, f))
    return results

html_files = find_html_files(SITE_DIR)
print(f"Found {len(html_files)} HTML files to process")

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    file_dir = os.path.dirname(html_file)
    rel_path = os.path.relpath(SITE_DIR, file_dir)
    prefix = '.' if rel_path == '.' else rel_path

    # Replace Webflow shared CSS
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6876191b7d74b10df8a3933b/css/pumpkn-2025[^"\']*',
        f'{prefix}/css/webflow.css',
        content
    )

    # Replace Webflow JS references
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6876191b7d74b10df8a3933b/js/webflow\.02c71056[^"\']*',
        f'{prefix}/js/webflow.main.js',
        content
    )
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6876191b7d74b10df8a3933b/js/webflow\.52561552[^"\']*',
        f'{prefix}/js/webflow.secondary.js',
        content
    )
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6876191b7d74b10df8a3933b/js/webflow\.schunk\.15d313e4[^"\']*',
        f'{prefix}/js/webflow.chunk1.js',
        content
    )
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6876191b7d74b10df8a3933b/js/webflow\.schunk\.36b8fb49[^"\']*',
        f'{prefix}/js/webflow.chunk2.js',
        content
    )

    # Replace Glide CSS
    content = content.replace(
        'https://cdn.jsdelivr.net/npm/@glidejs/glide/dist/css/glide.core.min.css',
        f'{prefix}/css/glide.core.min.css'
    )

    # Replace CDN image URLs with local paths
    def replace_cdn_image(match):
        filename = match.group(1)
        decoded = urllib.parse.unquote(filename)
        local_match = find_local_image(decoded)
        if local_match:
            return f'{prefix}/images/{local_match}'
        return match.group(0)

    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6876191b7d74b10df8a3933b/([^"\')\s]+)',
        replace_cdn_image,
        content
    )

    # Also handle old CDN pattern
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6565aa1950fe4c108399a361/([^"\')\s]+)',
        replace_cdn_image,
        content
    )

    # Handle CMS collection CDN patterns
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6876191b7d74b10df8a39349/([^"\')\s]+)',
        replace_cdn_image,
        content
    )
    content = re.sub(
        r'https://cdn\.prod\.website-files\.com/6565aa1950fe4c108399a397/([^"\')\s]+)',
        replace_cdn_image,
        content
    )

    # Remove integrity and crossorigin attributes (they won't match local files)
    content = re.sub(r'\s+integrity="[^"]*"', '', content)
    content = re.sub(r'\s+crossorigin="anonymous"', '', content)

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Processed: {os.path.relpath(html_file, SITE_DIR)}")

print("Build complete!")
