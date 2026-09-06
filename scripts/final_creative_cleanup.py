from pathlib import Path

ROOT = Path('.')

# Homepage: let enquiry-form users select the recurring creative plans too.
home = ROOT / 'home-v2.html'
t = home.read_text(encoding='utf-8')
needle = '<option value="video_creative">Creative Sprint ($1,500 / 4 weeks)</option>'
extra = needle + '\n          <option value="creative_engine">Creative Engine ($2,500 / month)</option>\n          <option value="creative_scale">Creative Scale ($4,000 / month)</option>'
if 'value="creative_engine"' not in t:
    if needle not in t:
        raise SystemExit('homepage creative dropdown anchor missing')
    t = t.replace(needle, extra, 1)
home.write_text(t, encoding='utf-8')

# Dedicated creative page: remove the last stale 3-ad / 72-hour copy.
video = ROOT / 'video-ads/index.html'
v = video.read_text(encoding='utf-8')
v = v.replace('Give us one pilot.<br>Judge the finished work.', 'Give us four weeks.<br>Judge the finished work.')
v = v.replace('3 custom vertical ads and 3 distinct hooks for $1,500 one-time.', '8 original ads over four weeks + 4 alternate hook cuts for $1,500.')
v = v.replace('No contract. Ad spend separate.', 'No long-term contract. Ad spend and approved third-party production costs are separate.')
v = v.replace('The 72-hour first-draft window starts when the required usable assets and business details have been received.', 'Weekly delivery begins after onboarding and the required usable assets and business details have been received.')
v = v.replace('When does the 72-hour window start?', 'When does weekly delivery start?')
v = v.replace('After the required usable assets and business details are received. A payment by itself does not start production if key inputs are still missing.', 'After onboarding and the required usable assets and business details are received. A payment by itself does not start production if key inputs are still missing.')
video.write_text(v, encoding='utf-8')

# Full Build: align it with the approved deposit path and the new Creative Sprint scope.
full = ROOT / 'full-build/index.html'
f = full.read_text(encoding='utf-8')
f = f.replace('<a href="/#work">Work</a>\n      <a href="/#hero">Services</a>', '<a href="/#hero">Services</a>\n      <a href="/#work">Work</a>')
f = f.replace('<a href="/about/">About</a>', '<a href="/about/">About me</a>')
f = f.replace('/api/checkout?plan=full_build&amp;term=one_time', '/api/checkout?plan=full_build&amp;term=deposit')
f = f.replace('Start Full Build — $7,500', 'Reserve Full Build — $3,750')
f = f.replace('Start Full Revenue Build — $7,500', 'Reserve Full Revenue Build — $3,750')
f = f.replace('The core Full Revenue Build is $7,500 — $1,000 less than buying Video Creative, the Conversion Website and Revenue Systems separately.', 'The core Full Revenue Build is $7,500 — $1,000 less than buying the Creative Sprint, Conversion Website and Revenue Systems separately. Start with a $3,750 project deposit; the remaining $3,750 is due before final launch of the agreed core scope.')
f = f.replace('<span class="flow-step-num">Launch creative</span><h3>Gets the launch attention.</h3><p>Initial video creative to bring traffic to the new site and system from day one.</p>', '<span class="flow-step-num">Creative Sprint</span><h3>Gets the launch attention.</h3><p>8 original vertical ads over four weeks plus 4 alternate hook cuts, built around the approved offer and launch direction.</p>')
f = f.replace('The $7,500 core Full Revenue Build is available for direct checkout above. If you need custom additions or want to confirm fit first, send the project brief here.', 'Reserve the $7,500 core Full Revenue Build with a $3,750 project deposit above. The remaining $3,750 is due before final launch of the agreed core scope. If you need custom additions or want to confirm fit first, send the project brief here.')
full.write_text(f, encoding='utf-8')

# Verify old offer language is gone from customer-facing creative pages.
creative_pages = [
    'video-ads/index.html','short-form-video-ads/index.html','ai-ugc-video-ads/index.html',
    'beauty-video-ads/index.html','ecommerce-product-video-ads/index.html','meta-ad-creative/index.html',
    'restaurant-video-ads/index.html','video-ads-for-home-services/index.html',
    'video-ads-for-roofing/index.html','white-label-ad-creative/index.html'
]
stale = ['3 custom vertical ads', '3 custom ads — $1,500', 'Three distinct 9:16 ad concepts for $1,500', 'Video Creative — $1,500']
for rel in creative_pages:
    s = (ROOT / rel).read_text(encoding='utf-8')
    for phrase in stale:
        if phrase in s:
            raise SystemExit(f'stale creative offer copy remains in {rel}: {phrase}')

if 'term=one_time' in f:
    raise SystemExit('full-build still contains one-time checkout path')
if 'Creative Sprint' not in f or '$3,750' not in f:
    raise SystemExit('full-build creative/deposit upgrade did not apply')
