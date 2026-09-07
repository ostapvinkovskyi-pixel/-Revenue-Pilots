from pathlib import Path


def replace_once(path: str, old: str, new: str):
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"Target not found in {path}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1))


def ensure_before(path: str, marker: str, block: str):
    p = Path(path)
    text = p.read_text()
    if block.strip() in text:
        return
    if marker not in text:
        raise SystemExit(f"Marker not found in {path}: {marker!r}")
    p.write_text(text.replace(marker, block + marker, 1))


# Shared stylesheet
css = r'''/* Premium website pricing ladder — Sep 2026 */
.rp-premium-tier{
  position:relative;
  margin-top:12px;
  padding:22px;
  border:1px solid rgba(255,255,255,.11);
  border-radius:20px;
  background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));
  overflow:hidden;
}
.rp-premium-tier::after{
  content:"";
  position:absolute;
  inset:auto -15% -55% 20%;
  height:150px;
  background:radial-gradient(circle,rgba(197,154,60,.16),transparent 68%);
  pointer-events:none;
}
.rp-premium-tier.is-recommended{
  border-color:rgba(197,154,60,.42);
  background:linear-gradient(145deg,rgba(197,154,60,.095),rgba(255,255,255,.018));
}
.rp-tier-kicker{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:10px;
  color:var(--gold,#C59A3C);
  font-size:10px;
  font-weight:800;
  letter-spacing:.15em;
  text-transform:uppercase;
}
.rp-tier-badge{
  padding:6px 9px;
  border:1px solid rgba(197,154,60,.35);
  border-radius:999px;
  color:#e7c66f;
  font-size:9px;
  letter-spacing:.1em;
  white-space:nowrap;
}
.rp-premium-tier h4,
.rp-pricing-card h3,
.rp-signature-card h3{margin:0;color:#fff;font-size:clamp(20px,2vw,28px)}
.rp-premium-price{
  margin:10px 0 8px;
  color:#fff;
  font-size:clamp(25px,3vw,38px);
  font-weight:800;
  letter-spacing:-.035em;
}
.rp-premium-price small{font-size:12px;color:rgba(255,255,255,.55);font-weight:600;letter-spacing:0}
.rp-premium-tier p,
.rp-pricing-card p,
.rp-signature-card p{color:rgba(255,255,255,.68);line-height:1.65}
.rp-premium-list{display:grid;gap:8px;margin:16px 0 18px;padding:0;list-style:none}
.rp-premium-list li{position:relative;padding-left:18px;color:rgba(255,255,255,.78);font-size:13px;line-height:1.45}
.rp-premium-list li::before{content:"";position:absolute;left:0;top:.55em;width:6px;height:6px;border-radius:50%;background:var(--gold,#C59A3C);box-shadow:0 0 12px rgba(197,154,60,.45)}
.rp-premium-link{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;color:#e7c66f;font-weight:750;text-decoration:none;font-size:13px}
.rp-premium-link:hover{text-decoration:underline}
.rp-pricing-ladder{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:34px}
.rp-pricing-card{position:relative;padding:26px;border:1px solid rgba(255,255,255,.1);border-radius:22px;background:rgba(10,13,18,.84);box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}
.rp-pricing-card.is-recommended{border-color:rgba(197,154,60,.45);background:linear-gradient(160deg,rgba(197,154,60,.105),rgba(10,13,18,.9) 46%)}
.rp-pricing-card .btn{margin-top:8px}
.rp-signature-wrap{margin-top:28px}
.rp-signature-card{position:relative;padding:clamp(28px,5vw,48px);border:1px solid rgba(197,154,60,.35);border-radius:28px;background:radial-gradient(90% 100% at 0 0,rgba(197,154,60,.12),transparent 58%),rgba(9,12,17,.9);overflow:hidden}
.rp-signature-card::before{content:"SIGNATURE";position:absolute;right:28px;top:24px;color:rgba(197,154,60,.55);font-size:10px;font-weight:800;letter-spacing:.22em}
.rp-signature-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:34px;align-items:end}
.rp-signature-actions{display:flex;flex-direction:column;gap:10px;align-items:stretch}
.rp-signature-note{font-size:12px;color:rgba(255,255,255,.5);text-align:center}
@media(max-width:900px){
  .rp-pricing-ladder{grid-template-columns:1fr}
  .rp-signature-grid{grid-template-columns:1fr}
}
@media(max-width:640px){
  .rp-premium-tier,.rp-pricing-card{padding:20px}
  .rp-signature-card{padding:24px 20px}
  .rp-signature-card::before{position:static;display:block;margin-bottom:16px}
}
'''
Path('css/premium-pricing.css').write_text(css)

# ---------------- Home ----------------
home = 'home-v2.html'
ensure_before(home, '<script type="application/ld+json">', '<link rel="stylesheet" href="css/premium-pricing.css">\n')

old_home_tier = r'''            <div class="v4-pkg-tiers">
              <div class="v4-tier">
                <h3 class="v4-tier-name">Conversion Website</h3>
                <p class="v4-tier-price">$3,500</p>
                <ul class="v4-tier-list">
                  <li>Custom visual direction</li>
                  <li>Responsive desktop + mobile build</li>
                  <li>Motion and interaction where it adds value</li>
                  <li>Conversion architecture + lead capture</li>
                  <li>Core integrations</li>
                </ul>
                <p class="rp-start-price"><strong>$1,750 project deposit</strong><span>$3,500 total · $1,750 remaining before launch</span></p>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=website&amp;term=deposit">Start Conversion Website &mdash; $1,750</a>
                <p class="v4-checkout-note">Secure Stripe checkout &middot; remaining $1,750 due before final launch</p>
                <a class="rp-prebuy" href="#contact">Ask a question before starting →</a>
              </div>
            </div>'''
new_home_tier = r'''            <div class="v4-pkg-tiers">
              <div class="v4-tier">
                <h3 class="v4-tier-name">Conversion Website</h3>
                <p class="v4-tier-price">$3,500</p>
                <ul class="v4-tier-list">
                  <li>Custom visual direction</li>
                  <li>Responsive desktop + mobile build</li>
                  <li>Tasteful motion where it improves the experience</li>
                  <li>Conversion architecture + lead capture</li>
                  <li>Core integrations</li>
                </ul>
                <p class="rp-start-price"><strong>$1,750 project deposit</strong><span>$3,500 total · $1,750 after approval, before launch</span></p>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=website&amp;term=deposit">Start Conversion Website &mdash; $1,750</a>
                <p class="v4-checkout-note">Secure Stripe checkout &middot; remaining $1,750 due after approval, before final launch</p>
                <a class="rp-prebuy" href="#contact">Ask a question before starting →</a>
              </div>

              <div class="rp-premium-tier is-recommended">
                <div class="rp-tier-kicker"><span>Cinematic Website</span><span class="rp-tier-badge">Premium service brands</span></div>
                <h4>Make the website itself part of the sales experience.</h4>
                <p class="rp-premium-price">From $5,500</p>
                <p>Custom visual production, scroll storytelling and advanced motion for businesses where presentation needs to match a high-value offer.</p>
                <ul class="rp-premium-list"><li>Everything in Conversion Website</li><li>Custom cinematic visual direction</li><li>Scroll-controlled storytelling / advanced motion</li><li>Video or generated visual production as scoped</li></ul>
                <a class="rp-premium-link" href="#contact">Discuss a Cinematic Website →</a>
              </div>

              <div class="rp-premium-tier">
                <div class="rp-tier-kicker"><span>Signature Interactive</span><span class="rp-tier-badge">Bespoke</span></div>
                <h4>For experiences that need deeper interaction or real-time 3D.</h4>
                <p class="rp-premium-price">From $7,500</p>
                <p>Complex interactive art direction, custom interaction systems and WebGL / real-time 3D when it genuinely improves the story.</p>
                <ul class="rp-premium-list"><li>Bespoke interaction architecture</li><li>Advanced scroll / pointer experiences</li><li>Real-time 3D or WebGL where appropriate</li><li>Performance and mobile fallback planning</li></ul>
                <a class="rp-premium-link" href="#contact">Plan a Signature Interactive build →</a>
              </div>
            </div>'''
replace_once(home, old_home_tier, new_home_tier)

replace_once(home, '<div class="rp-system-event"><time>8:42 AM</time><div><b>New quote request</b>', '<div class="rp-system-event"><time>NOW</time><div><b>New quote request</b>')
replace_once(home, '<div class="rp-system-event"><time>8:42 AM</time><div><b>Confirmation + owner alert</b>', '<div class="rp-system-event"><time>+0 MIN</time><div><b>Confirmation + owner alert</b>')

signature_home = r'''

    <div class="rp-signature-wrap">
      <div class="rp-signature-card">
        <div class="rp-signature-grid">
          <div>
            <div class="rp-tier-kicker"><span>Signature Revenue Build</span><span class="rp-tier-badge">For premium / high-ticket businesses</span></div>
            <h3>When the experience has to feel as valuable as the thing you sell.</h3>
            <p class="rp-premium-price">From $9,500</p>
            <p>A cinematic website, Revenue Systems and launch creative scoped as one premium build. Best for businesses selling high-value services, luxury projects or products where a standard website would undersell the offer.</p>
            <ul class="rp-premium-list"><li>Cinematic website direction from the $5,500 tier</li><li>Lead capture, routing, booking and pipeline handoff</li><li>Launch creative concepts around the approved offer</li><li>Custom scope confirmed before any deposit is requested</li></ul>
          </div>
          <div class="rp-signature-actions">
            <a class="btn btn-gold btn-block" href="#contact">Discuss a Signature Build</a>
            <span class="rp-signature-note">Real-time 3D / WebGL or unusually complex production is quoted above the starting price when required.</span>
          </div>
        </div>
      </div>
    </div>'''
ensure_before(home, '\n    <div class="rp-confidence-panel"', signature_home)

replace_once(home,
'''          <option value="website_build">Conversion Website ($3,500)</option>''',
'''          <option value="website_build">Conversion Website ($3,500)</option>\n          <option value="cinematic_website">Cinematic Website (from $5,500)</option>\n          <option value="signature_interactive">Signature Interactive Website (from $7,500)</option>''')
replace_once(home,
'''          <option value="full_build">Full Revenue Build ($7,500)</option>''',
'''          <option value="full_build">Full Revenue Build ($7,500)</option>\n          <option value="signature_revenue_build">Signature Revenue Build (from $9,500)</option>''')

faq_anchor = '''      <details><summary>What happens if I need something outside the package?</summary><p>Custom pages, advanced integrations, additional creative or other work outside the core package are scoped and quoted separately before that extra work is done.</p></details>'''
faq_extra = faq_anchor + '''\n      <details><summary>What is the difference between a $3,500 website and a Cinematic / Signature website?</summary><p>The $3,500 Conversion Website covers a strong custom responsive build, conversion architecture, lead capture and tasteful motion. Cinematic Websites start at $5,500 because they add custom visual production, scroll storytelling and more advanced motion. Signature Interactive builds start at $7,500 when the concept requires bespoke interaction systems or real-time 3D / WebGL.</p></details>'''
replace_once(home, faq_anchor, faq_extra)

# ---------------- Websites page ----------------
websites = 'websites/index.html'
ensure_before(websites, '<script src="../config/site-config.js" defer></script>', '<link rel="stylesheet" href="../css/premium-pricing.css">\n')
replace_once(websites, '<title>Conversion Website — $3,500 — Revenue Pilots</title>', '<title>Custom, Cinematic & Interactive Websites — Revenue Pilots</title>')
replace_once(websites,
'<meta name="description" content="Premium conversion-focused business websites for $3,500: custom visual direction, responsive build, conversion architecture, lead capture and core integrations. Start with a $1,750 project deposit.">',
'<meta name="description" content="Revenue Pilots websites start at $3,500, with cinematic builds from $5,500 and bespoke interactive / 3D experiences from $7,500. Custom responsive design, conversion architecture and lead capture.">')
replace_once(websites,
'<meta property="og:description" content="Conversion Website — $3,500 total. Start with a $1,750 project deposit. Premium responsive design, conversion architecture, lead capture and core integrations.">',
'<meta property="og:description" content="Conversion Website $3,500 · Cinematic Website from $5,500 · Signature Interactive from $7,500. Built around the offer, customer journey and experience.">')
replace_once(websites,
'<p class="section-sub reveal" style="max-width:64ch;font-size:17px;">A custom business website built around your real offer, customer journey and conversion path — not a generic template dressed in your logo. The total project price is $3,500.</p>',
'<p class="section-sub reveal" style="max-width:64ch;font-size:17px;">Start with a custom conversion website at $3,500, or step up to cinematic and signature interactive experiences when the website itself needs to feel as premium as what you sell.</p>')

pricing_section = r'''

<section class="section" id="website-levels">
  <div class="shell">
    <header class="section-head"><p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>Website levels</p><h2 class="section-title">Choose the level of experience your offer deserves.</h2><p class="section-sub">The core conversion build stays simple to buy. More production-heavy cinematic and interactive concepts are scoped separately so a normal website never carries the cost of a signature experience.</p></header>
    <div class="rp-pricing-ladder">
      <article class="rp-pricing-card reveal">
        <div class="rp-tier-kicker"><span>Conversion Website</span><span class="rp-tier-badge">Core</span></div>
        <h3>Professional, custom and conversion-focused.</h3>
        <p class="rp-premium-price">$3,500</p>
        <p>For businesses that need a serious custom website without a production-heavy interactive concept.</p>
        <ul class="rp-premium-list"><li>Custom visual direction</li><li>Responsive desktop + mobile build</li><li>Lead capture + conversion path</li><li>Tasteful motion + core integrations</li></ul>
        <a class="btn btn-gold btn-block" href="/api/checkout?plan=website&amp;term=deposit">Start — $1,750</a>
      </article>
      <article class="rp-pricing-card is-recommended reveal">
        <div class="rp-tier-kicker"><span>Cinematic Website</span><span class="rp-tier-badge">Recommended for premium brands</span></div>
        <h3>Turn the scroll into part of the pitch.</h3>
        <p class="rp-premium-price">From $5,500</p>
        <p>For high-ticket services and premium brands where art direction, custom visuals and storytelling materially change how the company is perceived.</p>
        <ul class="rp-premium-list"><li>Everything in Conversion Website</li><li>Custom cinematic visual production</li><li>Scroll-controlled storytelling</li><li>Advanced motion + transition direction</li></ul>
        <a class="btn btn-ghost btn-block" href="#contact">Discuss Cinematic scope</a>
      </article>
      <article class="rp-pricing-card reveal">
        <div class="rp-tier-kicker"><span>Signature Interactive</span><span class="rp-tier-badge">Bespoke</span></div>
        <h3>For deeper interaction and real-time 3D.</h3>
        <p class="rp-premium-price">From $7,500</p>
        <p>For concepts that require custom interaction architecture, advanced scroll systems or real-time 3D / WebGL rather than a standard site build.</p>
        <ul class="rp-premium-list"><li>Bespoke interaction system</li><li>Advanced scroll / pointer experiences</li><li>Real-time 3D / WebGL when appropriate</li><li>Performance + mobile fallback planning</li></ul>
        <a class="btn btn-ghost btn-block" href="#contact">Plan a Signature build</a>
      </article>
    </div>
  </div>
</section>
'''
ensure_before(websites, '<section class="section" id="concepts">', pricing_section)

website_faq_anchor = '<details><summary>What happens if I need more than the core package?</summary><p>Custom pages, advanced integrations or work outside the agreed core package are scoped and quoted separately before that additional work is done.</p></details>'
replace_once(websites, website_faq_anchor, website_faq_anchor + '\n      <details><summary>Why do Cinematic and Signature websites cost more?</summary><p>They require additional visual production, interaction design, animation engineering, testing and fallback work. Cinematic builds start at $5,500; bespoke Signature Interactive builds start at $7,500 and are scoped before work begins.</p></details>')
replace_once(websites,
'''          <option value="website_build" selected>Conversion Website ($3,500)</option>\n          <option value="full_build">Full Revenue Build ($7,500)</option>''',
'''          <option value="website_build" selected>Conversion Website ($3,500)</option>\n          <option value="cinematic_website">Cinematic Website (from $5,500)</option>\n          <option value="signature_interactive">Signature Interactive Website (from $7,500)</option>\n          <option value="full_build">Full Revenue Build ($7,500)</option>\n          <option value="signature_revenue_build">Signature Revenue Build (from $9,500)</option>''')

# ---------------- Full build page ----------------
full = 'full-build/index.html'
ensure_before(full, '<script src="../config/site-config.js" defer></script>', '<link rel="stylesheet" href="../css/premium-pricing.css">\n')
replace_once(full,
'<meta name="description" content="Full Revenue Build — $7,500. Website, customer system and launch creative built together for a business that wants one connected partner instead of three vendors.">',
'<meta name="description" content="Full Revenue Build $7,500, or Signature Revenue Build from $9,500 for businesses that need a cinematic website, customer system and launch creative built as one premium experience.">')

signature_full = r'''

<section class="section" id="signature-build">
  <div class="shell">
    <div class="rp-signature-card reveal">
      <div class="rp-signature-grid">
        <div>
          <div class="rp-tier-kicker"><span>Signature Revenue Build</span><span class="rp-tier-badge">Premium / high-ticket businesses</span></div>
          <h3>A bigger digital experience for a bigger offer.</h3>
          <p class="rp-premium-price">From $9,500</p>
          <p>Use this when the core $7,500 build is not visually ambitious enough. The Signature version pairs a Cinematic Website with Revenue Systems and launch creative so the front-end experience and the lead handling behind it feel like one premium system.</p>
          <ul class="rp-premium-list"><li>Cinematic Website direction from the $5,500 tier</li><li>Lead capture, routing, booking and pipeline handoff</li><li>Launch creative concepts built around the approved offer</li><li>Scope, integrations and visual production confirmed before deposit</li></ul>
        </div>
        <div class="rp-signature-actions">
          <a class="btn btn-gold btn-block" href="#contact">Discuss Signature Revenue Build</a>
          <span class="rp-signature-note">Real-time 3D / WebGL or unusually complex production can increase the scope above the $9,500 starting point.</span>
        </div>
      </div>
    </div>
  </div>
</section>
'''
ensure_before(full, '<section class="section section-contact" id="contact">', signature_full)
replace_once(full,
'''          <option value="full_build" selected>Full Revenue Build ($7,500)</option>\n          <option value="not_sure">Not sure yet</option>''',
'''          <option value="full_build" selected>Full Revenue Build ($7,500)</option>\n          <option value="signature_revenue_build">Signature Revenue Build (from $9,500)</option>\n          <option value="not_sure">Not sure yet</option>''')

print('Premium pricing patch applied successfully.')
