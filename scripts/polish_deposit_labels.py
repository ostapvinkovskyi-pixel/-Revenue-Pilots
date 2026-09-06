from pathlib import Path

replacements = [
    ('<p class="rp-start-price"><strong>$1,750 to start</strong><span>$3,500 total · project deposit</span></p>', '<p class="rp-start-price"><strong>$1,750 project deposit</strong><span>$3,500 total · $1,750 remaining before launch</span></p>'),
    ('<p class="rp-start-price" style="justify-content:center"><strong>$3,750 to start</strong><span>$7,500 total · project deposit</span></p>', '<p class="rp-start-price" style="justify-content:center"><strong>$3,750 project deposit</strong><span>$7,500 total · $3,750 remaining before launch</span></p>'),
    ('Start Conversion Website &mdash; $1,750 deposit', 'Start Conversion Website &mdash; $1,750'),
    ('Start Revenue Systems &mdash; $1,750 deposit', 'Start Revenue Systems &mdash; $1,750'),
    ('Start Full Build &mdash; $3,750 deposit', 'Start Full Build &mdash; $3,750'),
    ('Start Conversion Website — $1,750 deposit', 'Start Conversion Website — $1,750'),
    ('Start Revenue Systems — $1,750 deposit', 'Start Revenue Systems — $1,750'),
    ('Start Full Revenue Build — $3,750 deposit', 'Start Full Revenue Build — $3,750'),
    ('Reserve Website — $1,750', 'Start Website — $1,750'),
    ('Reserve Systems — $1,750', 'Start Systems — $1,750'),
]

changed = []
for path in Path('.').rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    new = text
    for old, repl in replacements:
        new = new.replace(old, repl)
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed.append(str(path))

print('changed:', ', '.join(changed) if changed else 'none')
