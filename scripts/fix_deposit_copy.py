from pathlib import Path

ROOT = Path('.')

replacements = [
    (' · 50% project deposit', ' · project deposit'),
    ('50% Stripe deposit', 'project deposit'),
    ('50% project deposit', 'project deposit'),
    ('Reserve Conversion Website &mdash; $1,750', 'Start Conversion Website &mdash; $1,750 deposit'),
    ('Reserve Revenue Systems &mdash; $1,750', 'Start Revenue Systems &mdash; $1,750 deposit'),
    ('Reserve Full Build &mdash; $3,750', 'Start Full Build &mdash; $3,750 deposit'),
    ('Reserve Conversion Website — $1,750', 'Start Conversion Website — $1,750 deposit'),
    ('Reserve Revenue Systems — $1,750', 'Start Revenue Systems — $1,750 deposit'),
    ('Reserve Full Build — $3,750', 'Start Full Build — $3,750 deposit'),
    ('Reserve Full Revenue Build — $3,750', 'Start Full Revenue Build — $3,750 deposit'),
]

changed = []
for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    new = text
    for old, repl in replacements:
        new = new.replace(old, repl)
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed.append(str(path))

print('changed:', ', '.join(changed) if changed else 'none')
