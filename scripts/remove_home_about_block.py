from pathlib import Path

path = Path('home-v2.html')
html = path.read_text(encoding='utf-8')

about_block = '''    <div class="v2-about-copy reveal">
      <p class="v2-eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>About Revenue Pilots</p>
      <h2 class="v2-lead">Built so the pieces work together.</h2>
      <p class="v2-body">I&rsquo;m Ostap Vinkovskyi, founder of Revenue Pilots. I built the company around a simple frustration: creative, websites and follow-up are often treated like separate jobs even though a customer experiences them as one path. Revenue Pilots brings those pieces together when a business needs the full system &mdash; and can still build them one at a time.</p>
      <p class="v2-body">The promise is straightforward: clear scope, direct communication and honest proof. You work directly with me from the initial scope through the build instead of being handed from sales to an account layer that never touches the work.</p>
      <p class="v2-about-line">Based in the Charlotte / Fort Mill area.</p>
    </div>
'''

if about_block not in html:
    raise SystemExit('Homepage About block not found; refusing to guess')

html = html.replace(about_block, '', 1)

# About now lives on its dedicated page; keep the homepage focused on selling.
old = '<a href="#about">About me</a>'
if html.count(old) < 2:
    raise SystemExit(f'Expected desktop + mobile About links, found {html.count(old)}')
html = html.replace(old, '<a href="/about/">About me</a>', 2)

path.write_text(html, encoding='utf-8')
print('Removed homepage About copy and restored About links to /about/')
