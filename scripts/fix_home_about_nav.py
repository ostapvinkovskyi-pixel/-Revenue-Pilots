from pathlib import Path

path = Path('home-v2.html')
html = path.read_text(encoding='utf-8')
old = '<a href="/about/">About me</a>'
new = '<a href="#about">About me</a>'
count = html.count(old)
if count < 2:
    raise SystemExit(f'Expected at least 2 About nav links, found {count}')
html = html.replace(old, new, 2)
path.write_text(html, encoding='utf-8')
print('Updated desktop + mobile About nav links to #about')
