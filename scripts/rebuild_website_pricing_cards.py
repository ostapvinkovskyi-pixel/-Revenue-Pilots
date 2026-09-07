from pathlib import Path
import re

path = Path('home-v2.html')
text = path.read_text()

start = '<div class="v4-fade v4-pkg-pane" data-pkg-pane="websites" hidden>'
next_start = '<div class="v4-fade v4-pkg-pane" data-pkg-pane="systems" hidden>'

pattern = re.compile(
    r'          <div class="v4-fade v4-pkg-pane" data-pkg-pane="websites" hidden>.*?(?=\n\n          <div class="v4-fade v4-pkg-pane" data-pkg-pane="systems" hidden>)',
    re.S,
)

replacement = '''          <div class="v4-fade v4-pkg-pane" data-pkg-pane="websites" hidden>
            <div class="rp-creative-intro">
              <div><small>Website builds</small><h3>Choose the level of experience your business needs.</h3></div>
              <p>Start with a conversion-focused custom site, or step up to cinematic and interactive work when the website itself needs to sell the quality of your offer.</p>
            </div>

            <div class="rp-creative-grid rp-website-offer-grid">
              <article class="rp-creative-offer">
                <span class="rp-offer-badge">Best for most businesses</span>
                <h4>Conversion Website</h4>
                <p class="rp-offer-price"><strong>$3,500</strong><span> total</span></p>
                <p class="rp-offer-output">A premium custom website built to turn attention into a clear next step.</p>
                <ul class="rp-offer-list">
                  <li>Custom visual direction</li>
                  <li>Responsive desktop + mobile build</li>
                  <li>Conversion architecture + lead capture</li>
                  <li>Tasteful motion where it improves the experience</li>
                  <li>Core integrations</li>
                  <li>Founder-led build + agreed revision scope</li>
                </ul>
                <p class="rp-start-price"><strong>$1,750 project deposit</strong><span>$1,750 after approval, before launch</span></p>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=website&amp;term=deposit">Start Conversion Website — $1,750</a>
                <p class="rp-offer-note">$3,500 total · secure Stripe checkout</p>
              </article>

              <article class="rp-creative-offer is-featured">
                <span class="rp-offer-badge">Premium experience</span>
                <h4>Cinematic Website</h4>
                <p class="rp-offer-price"><strong>From $5,500</strong></p>
                <p class="rp-offer-output">For high-value businesses where the website should feel as premium as the service being sold.</p>
                <ul class="rp-offer-list">
                  <li>Everything in Conversion Website</li>
                  <li>Custom cinematic visual direction</li>
                  <li>Scroll-controlled storytelling</li>
                  <li>Advanced motion + richer transitions</li>
                  <li>Custom video / generated visual production as scoped</li>
                  <li>Mobile fallback + performance planning</li>
                </ul>
                <a class="btn btn-gold btn-block" href="#contact">Discuss Cinematic Website</a>
                <p class="rp-offer-note">Custom scope confirmed before any deposit</p>
              </article>

              <article class="rp-creative-offer">
                <span class="rp-offer-badge">Bespoke / interactive</span>
                <h4>Signature Interactive</h4>
                <p class="rp-offer-price"><strong>From $7,500</strong></p>
                <p class="rp-offer-output">A custom digital experience for brands that need deeper interaction, 3D or a true signature moment.</p>
                <ul class="rp-offer-list">
                  <li>Bespoke interaction architecture</li>
                  <li>Advanced scroll + pointer experiences</li>
                  <li>Real-time 3D / WebGL when it adds value</li>
                  <li>Custom art direction around the business</li>
                  <li>Performance + mobile fallback planning</li>
                  <li>Production scope built around the concept</li>
                </ul>
                <a class="btn btn-gold btn-block" href="#contact">Plan Signature Interactive</a>
                <p class="rp-offer-note">Starting price · final scope quoted before work begins</p>
              </article>
            </div>

            <p class="rp-creative-fineprint"><strong>Want to inspect the work?</strong> Open our fictional interactive concept <a href="demo/altura/" target="_blank" rel="noopener">ORVYN live demo ↗</a>. Concept/spec work is labeled honestly and is not presented as a client result.</p>
          </div>'''

new_text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f'Expected to replace one website pane, replaced {count}')

path.write_text(new_text)
print('Rebuilt website package pane as three clean offer cards.')
