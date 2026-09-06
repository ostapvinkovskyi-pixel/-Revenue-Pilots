from pathlib import Path
import re

ROOT = Path('.')

# ---------- Homepage ----------
home = ROOT / 'home-v2.html'
t = home.read_text(encoding='utf-8')

css_anchor = '<link rel="stylesheet" href="css/trust-conversion.css">'
css_link = '<link rel="stylesheet" href="css/creative-offers.css">'
if css_link not in t:
    if css_anchor not in t:
        raise SystemExit('home stylesheet anchor missing')
    t = t.replace(css_anchor, css_anchor + '\n' + css_link, 1)

t = t.replace('Video Creative $1,500 · Conversion Website $3,500', 'Creative Sprint $1,500 / 4 weeks · Conversion Website $3,500', 1)
t = t.replace('<p class="v2-desc" id="v2Desc">Short-form advertising built around hooks, offers and testing.</p>', '<p class="v2-desc" id="v2Desc">Eight original ads over four weeks, plus extra hooks to keep testing fresh.</p>', 1)
t = t.replace('<p class="v2-price" id="v2Price">Video Creative — <strong>$1,500</strong></p>', '<p class="v2-price" id="v2Price">Creative Sprint — <strong>$1,500 / 4 weeks</strong></p>', 1)
t = t.replace('>Start Video Creative — $1,500</a>', '>Start Creative Sprint — $1,500</a>', 1)

creative_block = '''          <div class="v4-fade v4-pkg-pane is-active rp-creative-pane" data-pkg-pane="creative">
            <div class="rp-creative-intro">
              <div><small>Creative production</small><h3>Choose the pace your business needs.</h3></div>
              <p>Start with a four-week sprint or keep a monthly testing engine running. Original ads are distinct concepts; hook variations are alternate openings built from selected core ads.</p>
            </div>
            <div class="rp-creative-grid">
              <article class="rp-creative-offer">
                <span class="rp-offer-badge">Best first project</span>
                <h4>Creative Sprint</h4>
                <p class="rp-offer-price"><strong>$1,500</strong><span>/ 4 weeks</span></p>
                <p class="rp-offer-output">8 original ads + 4 hook cuts = 12 ad-ready exports</p>
                <ul class="rp-offer-list">
                  <li>2 new original vertical ads every week</li>
                  <li>4 alternate opening-hook cuts</li>
                  <li>Hooks/scripts + CTA copy</li>
                  <li>Captions, branding and social-ready exports</li>
                  <li>1 revision round per weekly batch</li>
                  <li>No long-term contract</li>
                </ul>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=starter&amp;term=one_time">Start Creative Sprint — $1,500</a>
                <p class="rp-offer-note">One-time 4-week engagement · secure Stripe checkout</p>
              </article>

              <article class="rp-creative-offer is-featured">
                <span class="rp-offer-badge">Most popular</span>
                <h4>Creative Engine</h4>
                <p class="rp-offer-price"><strong>$2,500</strong><span>/ month</span></p>
                <p class="rp-offer-output">12 original ads + 12 hook variations = 24 ad-ready exports</p>
                <ul class="rp-offer-list">
                  <li>3 new original ads per week</li>
                  <li>12 alternate opening hooks</li>
                  <li>Up to 2 products / offers</li>
                  <li>Monthly creative map + weekly delivery</li>
                  <li>Performance-led iteration when usable data is shared</li>
                  <li>2 revision rounds per month</li>
                </ul>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=creative_engine&amp;term=monthly">Start Creative Engine — $2,500/mo</a>
                <p class="rp-offer-note">Month-to-month · renews monthly until canceled</p>
              </article>

              <article class="rp-creative-offer">
                <span class="rp-offer-badge">High volume</span>
                <h4>Creative Scale</h4>
                <p class="rp-offer-price"><strong>$4,000</strong><span>/ month</span></p>
                <p class="rp-offer-output">16 original ads + 16 hook variations = 32 ad-ready exports</p>
                <ul class="rp-offer-list">
                  <li>4 new original ads per week</li>
                  <li>16 alternate opening hooks</li>
                  <li>Up to 3 products / offers</li>
                  <li>Creative testing map + weekly delivery</li>
                  <li>Priority production + performance feedback review</li>
                  <li>2 revision rounds per month</li>
                </ul>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=creative_scale&amp;term=monthly">Start Creative Scale — $4,000/mo</a>
                <p class="rp-offer-note">Month-to-month · renews monthly until canceled</p>
              </article>
            </div>
            <p class="rp-creative-fineprint"><strong>Separate when required and approved in advance:</strong> ad spend, paid talent/creator fees, creator-handle whitelisting/partnership ads, product shipping and unusual third-party production costs.</p>
          </div>

'''
pat = re.compile(r'          <div class="v4-fade v4-pkg-pane is-active" data-pkg-pane="creative">[\s\S]*?(?=          <div class="v4-fade v4-pkg-pane" data-pkg-pane="websites")')
if 'class="v4-fade v4-pkg-pane is-active rp-creative-pane"' not in t:
    t, n = pat.subn(creative_block, t, count=1)
    if n != 1:
        raise SystemExit('home creative package pane anchor missing')

t = t.replace('Video Creative remains a fixed $1,500 package paid in full at checkout.', 'Creative Sprint remains a fixed $1,500 four-week package paid in full at checkout. Creative Engine and Creative Scale renew monthly until canceled.', 1)
t = t.replace('<option value="video_creative">Video Creative ($1,500)</option>', '<option value="video_creative">Creative Sprint ($1,500 / 4 weeks)</option>', 1)
home.write_text(t, encoding='utf-8')

# ---------- Dedicated Video Ads page ----------
page = ROOT / 'video-ads/index.html'
v = page.read_text(encoding='utf-8')

css_anchor = '<link rel="stylesheet" href="../css/portfolio-v3.css">'
css_link = '<link rel="stylesheet" href="../css/creative-offers.css">'
if css_link not in v:
    if css_anchor not in v:
        raise SystemExit('video page stylesheet anchor missing')
    v = v.replace(css_anchor, css_anchor + '\n' + css_link, 1)

replacements = {
    'Start with 3 custom vertical ads and 3 distinct hooks for $1,500 one-time.': 'Start with 8 original vertical ads over four weeks plus 4 alternate hook cuts for $1,500.',
    '3 custom vertical ads. 3 distinct hooks. $1,500 one-time. No contract.': '8 original ads. 4 hook cuts. $1,500 for four weeks. No long-term contract.',
    'A one-time pilot with three custom vertical video ads and three distinct hooks built around a business\'s real offer, service area and brand.': 'A four-week Creative Sprint with eight original vertical ads and four alternate hook cuts built around a business\'s real offer, audience and brand.',
    'Short-form 9:16 creative for Meta, Reels and TikTok. Start with <strong>3 custom ads, 3 distinct hooks, and one clear offer — $1,500 one-time.</strong>': 'Short-form 9:16 creative for Meta, Reels and TikTok. Start with <strong>8 original ads over four weeks + 4 alternate hook cuts — $1,500.</strong>',
    'No contract. One revision round. First drafts within 72 hours after usable assets are received. Ad spend separate.': 'Four-week engagement. Two new original ads each week. One revision round per weekly batch. Ad spend and approved third-party production costs are separate.',
    '<span class="proof-kicker">3 distinct hooks</span><p class="proof-copy">Different opening angles, not one edit with tiny changes.</p>': '<span class="proof-kicker">4 hook cuts</span><p class="proof-copy">Alternate openings on selected core ads give you more angles to test.</p>',
    '<span class="proof-kicker">72h first drafts</span><p class="proof-copy">The clock starts after usable assets are received.</p>': '<span class="proof-kicker">2 ads / week</span><p class="proof-copy">Eight original ads are delivered across the four-week sprint.</p>',
    '<span class="proof-kicker">No contract</span><p class="proof-copy">One $1,500 Video Creative. Ad spend stays separate.</p>': '<span class="proof-kicker">No long-term contract</span><p class="proof-copy">One $1,500 four-week Creative Sprint. Continue only if the fit is there.</p>',
    'A strong paid-social concept can be attacked from different openings. The Video Creative includes three distinct hooks so you have different angles to test.': 'A strong paid-social concept can be attacked from different openings. The Creative Sprint includes eight original ads plus four alternate opening-hook cuts so the month is not dependent on one idea.',
    '<option value="not_sure">Not sure yet</option><option value="starter">Video Creative — $1,500</option>': '<option value="not_sure">Not sure yet</option><option value="starter">Creative Sprint — $1,500 / 4 weeks</option><option value="creative_engine">Creative Engine — $2,500 / month</option><option value="creative_scale">Creative Scale — $4,000 / month</option>',
    '<div class="mobile-revenue-bar" aria-label="Video Creative quick action"><p class="mobile-revenue-copy"><strong>Video Creative — $1,500</strong>3 ads · 3 hooks · no contract</p><button class="btn btn-gold" type="button" data-plan="starter">Start</button></div>': '<div class="mobile-revenue-bar" aria-label="Creative Sprint quick action"><p class="mobile-revenue-copy"><strong>Creative Sprint — $1,500</strong>8 original ads · 4 hook cuts · 4 weeks</p><a class="btn btn-gold" href="/api/checkout?plan=starter&amp;term=one_time">Start</a></div>'
}
for old, new in replacements.items():
    if old in v:
        v = v.replace(old, new, 1)

# JSON-LD offer description/name clean-up.
v = v.replace('"name":"Video Creative","price":"1500"', '"name":"Creative Sprint","price":"1500"', 1)
v = v.replace('"description":"Video Creative: 3 custom vertical video ads with 3 distinct creative angles, branding and CTA, one revision round"', '"description":"Creative Sprint: 8 original vertical ads over 4 weeks plus 4 alternate hook cuts, scripts/CTA copy, branding and weekly delivery"', 1)

pricing = '''<section class="section section-pricing pricing-v3" id="pricing">
  <div class="shell">
    <header class="section-head"><p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>Choose your creative pace</p><h2 class="section-title">Start with a sprint. Scale when the volume is useful.</h2><p class="section-sub">Original ads are distinct concepts. Hook variations are alternate openings built from selected core ads — useful testing volume without pretending every export is a brand-new production.</p></header>
    <div class="rp-creative-grid rp-creative-grid-page">
      <article class="rp-creative-offer reveal">
        <span class="rp-offer-badge">Best first project</span>
        <h4>Creative Sprint</h4>
        <p class="rp-offer-price"><strong>$1,500</strong><span>/ 4 weeks</span></p>
        <p class="rp-offer-output">8 original ads + 4 hook cuts = 12 ad-ready exports</p>
        <ul class="rp-offer-list"><li>2 original ads every week</li><li>4 alternate opening-hook cuts</li><li>Hooks/scripts + CTA copy</li><li>Captions, branding and social-ready exports</li><li>1 revision round per weekly batch</li><li>No long-term contract</li></ul>
        <a class="btn btn-gold btn-block" href="/api/checkout?plan=starter&amp;term=one_time">Start Creative Sprint — $1,500</a>
        <p class="rp-offer-note">One-time four-week engagement</p>
      </article>
      <article class="rp-creative-offer is-featured reveal">
        <span class="rp-offer-badge">Most popular</span>
        <h4>Creative Engine</h4>
        <p class="rp-offer-price"><strong>$2,500</strong><span>/ month</span></p>
        <p class="rp-offer-output">12 original ads + 12 hook variations = 24 ad-ready exports</p>
        <ul class="rp-offer-list"><li>3 original ads per week</li><li>12 alternate opening hooks</li><li>Up to 2 products / offers</li><li>Monthly creative map + weekly delivery</li><li>Performance-led iteration when usable data is shared</li><li>2 revision rounds per month</li></ul>
        <a class="btn btn-gold btn-block" href="/api/checkout?plan=creative_engine&amp;term=monthly">Start Creative Engine — $2,500/mo</a>
        <p class="rp-offer-note">Month-to-month · renews monthly until canceled</p>
      </article>
      <article class="rp-creative-offer reveal">
        <span class="rp-offer-badge">High volume</span>
        <h4>Creative Scale</h4>
        <p class="rp-offer-price"><strong>$4,000</strong><span>/ month</span></p>
        <p class="rp-offer-output">16 original ads + 16 hook variations = 32 ad-ready exports</p>
        <ul class="rp-offer-list"><li>4 original ads per week</li><li>16 alternate opening hooks</li><li>Up to 3 products / offers</li><li>Creative testing map + weekly delivery</li><li>Priority production + performance feedback review</li><li>2 revision rounds per month</li></ul>
        <a class="btn btn-gold btn-block" href="/api/checkout?plan=creative_scale&amp;term=monthly">Start Creative Scale — $4,000/mo</a>
        <p class="rp-offer-note">Month-to-month · renews monthly until canceled</p>
      </article>
    </div>
    <p class="rp-creative-fineprint"><strong>Separate when required and approved in advance:</strong> ad spend, paid talent/creator fees, creator-handle whitelisting/partnership ads, product shipping and unusual third-party production costs.</p>
    <div class="config-notice" id="checkoutNotice" role="status" aria-live="polite" hidden></div>
  </div>
</section>

'''
pat_pricing = re.compile(r'<section class="section section-pricing pricing-v3" id="pricing">[\s\S]*?(?=<section class="section section-how" id="how">)')
v, n = pat_pricing.subn(pricing, v, count=1)
if n != 1:
    raise SystemExit('video page pricing section anchor missing')

# Update the first two process steps and any old offer labels that remain in this page.
v = v.replace('<h3 class="step-title">Start Video Creative</h3><p class="step-body">Pay $1,500 through secure Stripe Checkout.</p>', '<h3 class="step-title">Start Creative Sprint</h3><p class="step-body">Pay $1,500 through secure Stripe Checkout to reserve the four-week sprint.</p>', 1)
v = v.replace('<h3 class="step-title">We build three angles</h3><p class="step-body">Creative is built around your actual business and the facts you approve.</p>', '<h3 class="step-title">We build weekly batches</h3><p class="step-body">Two original ads are delivered each week, with hook cuts added across the sprint.</p>', 1)
v = v.replace('Video Creative', 'Creative Sprint')
page.write_text(v, encoding='utf-8')

# ---------- Supporting creative SEO pages ----------
creative_pages = [
    'short-form-video-ads/index.html',
    'ai-ugc-video-ads/index.html',
    'beauty-video-ads/index.html',
    'ecommerce-product-video-ads/index.html',
    'meta-ad-creative/index.html',
    'restaurant-video-ads/index.html',
    'video-ads-for-home-services/index.html',
    'video-ads-for-roofing/index.html',
    'white-label-ad-creative/index.html',
]
for rel in creative_pages:
    p = ROOT / rel
    if not p.exists():
        continue
    s = p.read_text(encoding='utf-8')
    # Common public-offer wording. Keep the niche-specific narrative intact.
    common = [
        ('3 custom vertical ads for $1,500 one-time', '8 original vertical ads over 4 weeks + 4 hook cuts for $1,500'),
        ('3 custom vertical ads', '8 original vertical ads + 4 hook cuts'),
        ('3 custom ads — $1,500', '8 original ads + 4 hook cuts — $1,500'),
        ('3 custom ads', '8 original ads + 4 hook cuts'),
        ('3 distinct hooks / creative angles', '8 original creative angles + 4 alternate hook cuts'),
        ('3 distinct hooks', '4 alternate hook cuts'),
        ('Three distinct 9:16 ad concepts for $1,500 one-time', 'Eight original 9:16 ads over four weeks plus four alternate hook cuts for $1,500'),
        ('Three distinct creative angles', 'Eight original ads delivered as two per week, plus four alternate hook cuts'),
        ('Three custom vertical video ads', 'Eight original vertical video ads over four weeks plus four alternate hook cuts'),
        ('three custom vertical video ads', 'eight original vertical video ads over four weeks plus four alternate hook cuts'),
        ('Video Creative', 'Creative Sprint'),
        ('one revision round. First drafts within 72 hours after required usable assets are received', 'one revision round per weekly batch and weekly delivery across the four-week sprint'),
        ('First drafts within 72 hours after required usable assets are received', 'Two original ads are delivered each week after onboarding and required usable assets are received'),
    ]
    for old, new in common:
        s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')
