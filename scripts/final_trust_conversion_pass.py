from pathlib import Path
import re

p = Path('home-v2.html')
t = p.read_text(encoding='utf-8')

# 1) Load the additive trust/conversion stylesheet.
css_anchor = '<link rel="stylesheet" href="css/package-capabilities.css">'
css_link = '<link rel="stylesheet" href="css/trust-conversion.css">'
if css_link not in t:
    if css_anchor not in t:
        raise SystemExit('package-capabilities stylesheet anchor not found')
    t = t.replace(css_anchor, css_anchor + '\n' + css_link, 1)

# 2) Add honest confidence signals immediately after the core positioning chain.
chain = '''    <div class="v2-chain">
      <span>Creative</span><i>&rarr;</i><span>Website</span><i>&rarr;</i><span>Systems</span><i>&rarr;</i><span>Revenue</span>
    </div>'''
trust = chain + '''

    <div class="rp-trust-grid" aria-label="What clients can expect from Revenue Pilots">
      <article class="rp-trust-card"><small>Founder-led</small><strong>Direct communication</strong><p>You work directly with the person responsible for the scope, creative direction and build.</p></article>
      <article class="rp-trust-card"><small>Clear scope</small><strong>Know what you are buying</strong><p>Core deliverables are stated before the build. Custom additions are quoted separately instead of quietly expanding the project.</p></article>
      <article class="rp-trust-card"><small>Working proof</small><strong>Open the concepts yourself</strong><p>Our public website concepts can be opened and inspected. Spec work is labeled honestly rather than presented as a fake client result.</p></article>
      <article class="rp-trust-card"><small>Secure start</small><strong>Lower-risk project deposit</strong><p>Website, Systems and Full Build projects can start with a 50% Stripe deposit instead of requiring the full project price upfront.</p></article>
    </div>'''
if 'rp-trust-grid' not in t:
    if chain not in t:
        raise SystemExit('positioning chain anchor not found')
    t = t.replace(chain, trust, 1)

# 3) Turn the Website selected-work copy into an explicit capability case study.
old_web_copy = '''        <p class="v2-work-num">02 / Websites</p>
        <h3 class="v2-work-title">Built to convert, not just to look good.</h3>
        <p class="v4-sys-body">Every page has one job: turn attention into a booked call, a form fill or a sale. No decoration without a reason.</p>
        <ul class="v4-sys-outcomes">
          <li>Clarity</li>
          <li>One CTA</li>
          <li>Fast load</li>
          <li>Real data</li>
        </ul>'''
new_web_copy = '''        <p class="v2-work-num">02 / Websites</p>
        <h3 class="v2-work-title">A working concept, not a static mockup.</h3>
        <p class="v4-sys-body">ORVYN is a fictional interactive build created to demonstrate how we approach hierarchy, responsive composition, motion and a clear conversion path. Open it and inspect the work yourself.</p>
        <div class="rp-case-specs" aria-label="Website concept capabilities">
          <span>Responsive desktop + mobile</span>
          <span>Interactive hero + motion states</span>
          <span>Conversion hierarchy</span>
          <span>Working live concept</span>
        </div>'''
if old_web_copy in t:
    t = t.replace(old_web_copy, new_web_copy, 1)
elif 'A working concept, not a static mockup.' not in t:
    raise SystemExit('website selected-work copy anchor not found')

# 4) Make Systems understandable as a concrete business handoff instead of an abstract orbit diagram.
old_sys_copy = '''        <p class="v2-work-num">03 / Systems</p>
        <h3 class="v2-work-title">The follow-up that never gets forgotten.</h3>
        <p class="v4-sys-body">New leads get captured, followed up, booked and recorded automatically &mdash; nothing waits on someone remembering to check a shared inbox.</p>
        <ul class="v4-sys-outcomes">
          <li>Capture</li>
          <li>Follow up</li>
          <li>Book</li>
          <li>Record</li>
        </ul>'''
new_sys_copy = '''        <p class="v2-work-num">03 / Systems</p>
        <h3 class="v2-work-title">A lead should always know what happens next.</h3>
        <p class="v4-sys-body">Instead of selling "automation" as an abstract product, we map the real handoff: capture the enquiry, route it, move it toward booking where appropriate, and keep the customer record organized.</p>
        <div class="rp-case-specs" aria-label="Revenue System outcomes">
          <span>Structured lead capture</span>
          <span>Owner/team handoff</span>
          <span>Booking path where supported</span>
          <span>Pipeline / CRM record</span>
        </div>'''
if old_sys_copy in t:
    t = t.replace(old_sys_copy, new_sys_copy, 1)
elif 'A lead should always know what happens next.' not in t:
    raise SystemExit('systems selected-work copy anchor not found')

new_system_visual = '''      <div class="rp-system-case" role="img" aria-label="Example service business lead flow from quote request through pipeline handoff">
        <div class="rp-system-case-head"><div><small>Example / service business</small><strong>New quote request → organized opportunity</strong></div><span>One connected handoff</span></div>
        <div class="rp-system-events">
          <div class="rp-system-event"><time>8:42 AM</time><div><b>New quote request</b><p>Customer submits the agreed website or campaign intake form.</p></div><em>Captured</em></div>
          <div class="rp-system-event"><time>8:42 AM</time><div><b>Confirmation + owner alert</b><p>The customer gets acknowledgement and the business receives the structured lead details.</p></div><em>Routed</em></div>
          <div class="rp-system-event"><time>Next step</time><div><b>Booking path</b><p>If booking is included in the agreed workflow, the lead moves toward the correct scheduling step.</p></div><em>Ready</em></div>
          <div class="rp-system-event"><time>Handoff</time><div><b>Pipeline updated</b><p>The customer record and stage are passed to the agreed CRM, sheet or supported workflow destination.</p></div><em>Recorded</em></div>
        </div>
        <div class="rp-system-summary"><strong>The point:</strong> a clearer next step for the customer and fewer manual handoffs for the business. The exact implementation depends on the providers confirmed in scope.</div>
      </div>'''
if 'rp-system-case" role="img" aria-label="Example service business lead flow' not in t:
    pat = re.compile(r'      <div class="v4-net v4-net-lg" role="group"[\s\S]*?      </div>\n    </div>\n\n    <p class="v2-disclosure">', re.M)
    m = pat.search(t)
    if not m:
        raise SystemExit('selected-work systems visual anchor not found')
    replacement = new_system_visual + '\n    </div>\n\n    <p class="v2-disclosure">'
    t = t[:m.start()] + replacement + t[m.end():]

# 5) Lower-risk project deposits while keeping total pricing unchanged.
repls = {
'''                <a class="btn btn-gold btn-block" href="/api/checkout?plan=website&amp;term=one_time">Start Conversion Website &mdash; $3,500</a>
                <p class="v4-checkout-note">Secure Stripe checkout &middot; one-time payment</p>''':
'''                <p class="rp-start-price"><strong>$1,750 to start</strong><span>$3,500 total · 50% project deposit</span></p>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=website&amp;term=deposit">Reserve Conversion Website &mdash; $1,750</a>
                <p class="v4-checkout-note">Secure Stripe checkout &middot; remaining $1,750 due before final launch</p>
                <a class="rp-prebuy" href="#contact">Ask a question before starting →</a>''',
'''                <a class="btn btn-gold btn-block" href="/api/checkout?plan=systems&amp;term=one_time">Start Revenue Systems &mdash; $3,500</a>
                <p class="v4-checkout-note">Secure Stripe checkout &middot; one-time payment</p>''':
'''                <p class="rp-start-price"><strong>$1,750 to start</strong><span>$3,500 total · 50% project deposit</span></p>
                <a class="btn btn-gold btn-block" href="/api/checkout?plan=systems&amp;term=deposit">Reserve Revenue Systems &mdash; $1,750</a>
                <p class="v4-checkout-note">Secure Stripe checkout &middot; remaining $1,750 due before final launch</p>
                <a class="rp-prebuy" href="#contact">Ask a question before starting →</a>''',
'''      <a class="btn btn-gold btn-block v4-build-cta" href="/api/checkout?plan=full_build&amp;term=one_time"><span>Start Full Build &mdash; $7,500</span><span class="v4-build-arrow" aria-hidden="true">→</span></a>
      <p class="v4-checkout-note v4-checkout-note-center">Secure Stripe checkout &middot; one-time payment</p>''':
'''      <p class="rp-start-price" style="justify-content:center"><strong>$3,750 to start</strong><span>$7,500 total · 50% project deposit</span></p>
      <a class="btn btn-gold btn-block v4-build-cta" href="/api/checkout?plan=full_build&amp;term=deposit"><span>Reserve Full Build &mdash; $3,750</span><span class="v4-build-arrow" aria-hidden="true">→</span></a>
      <p class="v4-checkout-note v4-checkout-note-center">Secure Stripe checkout &middot; remaining $3,750 due before final launch</p>'''
}
for old, new in repls.items():
    if old in t:
        t = t.replace(old, new, 1)
    elif new not in t:
        raise SystemExit('deposit CTA anchor missing')

# 6) Explain what happens after payment before the premium Full Build offer.
notice = '    <div class="config-notice" id="checkoutNotice" role="status" aria-live="polite" hidden></div>'
journey = notice + '''

    <div class="rp-start-journey">
      <div class="rp-start-journey-head"><div><small>After checkout</small><h3>Know exactly what happens next.</h3></div><p>No disappearing into a generic portal. The project moves through a clear founder-led handoff.</p></div>
      <div class="rp-journey-grid">
        <div class="rp-journey-step"><span>01</span><strong>Onboarding</strong><p>We collect the offer, goals, assets, access and business context needed for the agreed package.</p></div>
        <div class="rp-journey-step"><span>02</span><strong>Scope confirmation</strong><p>Core deliverables, integrations and any custom additions are confirmed in writing before implementation.</p></div>
        <div class="rp-journey-step"><span>03</span><strong>First direction</strong><p>You see the first working creative, website or system direction before the project is finalized.</p></div>
        <div class="rp-journey-step"><span>04</span><strong>Finish + launch</strong><p>Agreed revisions are completed, final balance is handled where applicable, and approved work is launched or delivered.</p></div>
      </div>
    </div>'''
if 'Know exactly what happens next.' not in t:
    if notice not in t:
        raise SystemExit('checkout notice anchor not found')
    t = t.replace(notice, journey, 1)

# 7) Add a concise buyer-confidence panel after Full Build.
full_tail = '''      <p class="v4-pkg-sub">Need something different? <a href="#contact">Custom Build &mdash; custom quote</a></p>
    </div>'''
confidence = full_tail + '''

    <div class="rp-confidence-panel" aria-label="Buyer confidence">
      <div><small>What you can expect</small><h3>A serious project should feel clear before it starts.</h3><p>Revenue Pilots is deliberately founder-led. We keep the scope visible, label concept work honestly, use secure Stripe checkout and avoid promising results or integrations we cannot control.</p></div>
      <div class="rp-confidence-list"><span>Direct communication with the person responsible for the build</span><span>Core deliverables stated before implementation</span><span>Spec work labeled as spec — no fake client proof</span><span>Custom additions quoted before extra work is done</span><span>Third-party subscriptions or ad spend separated when required</span></div>
    </div>'''
if 'A serious project should feel clear before it starts.' not in t:
    if full_tail not in t:
        raise SystemExit('full build tail anchor not found')
    t = t.replace(full_tail, confidence, 1)

# 8) Tighten the generic process language.
process_repls = {
    'We find where attention or leads are leaking.': 'We review the offer, current customer path and where attention or leads are losing momentum.',
    'We create the missing creative, web or system layer.': 'We build the agreed creative, website or system layer around the actual business and scope.',
    'Everything gets connected and shipped.': 'We connect the agreed pieces, test the handoffs and launch the approved work.',
    'We use what happens next to decide what to test or improve.': 'After launch, what happens next informs the next test or improvement — without pretending we control the market.'
}
for old, new in process_repls.items():
    if old in t:
        t = t.replace(old, new, 1)

# 9) Add the major buying objections as an FAQ before About.
faq = '''<section class="v2-section" id="faq">
  <div class="shell rp-faq-wrap">
    <p class="v2-eyebrow">Before you start</p>
    <h2 class="v2-lead">Questions a serious buyer should ask.</h2>
    <div class="rp-faq-list">
      <details><summary>Do I have to pay a $3,500 or $7,500 project in full upfront?</summary><p>No for Website, Revenue Systems and Full Revenue Build. Those projects can start with a 50% Stripe deposit that is applied to the advertised total. Video Creative remains a fixed $1,500 package paid in full at checkout.</p></details>
      <details><summary>What happens after I pay?</summary><p>We begin onboarding using the contact details from checkout, confirm the agreed core scope and required access, then move into the first working direction. Remaining project balance is handled before final launch/delivery where a deposit option was used.</p></details>
      <details><summary>Are the websites shown real clients?</summary><p>Selected work includes fictional/spec concepts built to demonstrate our approach. They are labeled as concept/spec work and are not presented as client results. Public concepts can be opened so you can inspect the work directly.</p></details>
      <details><summary>Can Revenue Systems connect any tool or promise SMS/voice automation?</summary><p>No. Provider compatibility, consent requirements and supported integrations are confirmed in scope. SMS, voice, missed-call recovery or similar capabilities are not assumed unless the specific implementation is confirmed.</p></details>
      <details><summary>What if I need something outside the package?</summary><p>Custom pages, advanced integrations, additional creative or other work outside the core package are scoped and quoted separately before that extra work is done.</p></details>
      <details><summary>Who will I communicate with?</summary><p>Revenue Pilots is founder-led. You communicate directly with Ostap, who is responsible for the scope, creative direction and build process rather than being passed through layers of account management.</p></details>
    </div>
  </div>
</section>

<hr class="v2-rule">

'''
about_marker = '<section class="v2-section" id="about">'
if 'id="faq"' not in t:
    idx = t.rfind('<hr class="v2-rule">\n\n' + about_marker)
    if idx == -1:
        raise SystemExit('about section marker not found for FAQ')
    original = '<hr class="v2-rule">\n\n' + about_marker
    t = t[:idx] + '<hr class="v2-rule">\n\n' + faq + about_marker + t[idx+len(original):]

# 10) Strengthen the homepage founder signal and footer without inventing proof.
old_about = 'The promise is straightforward: clear scope, direct communication, honest proof and work built around the actual offer rather than a generic template.'
new_about = 'The promise is straightforward: clear scope, direct communication and honest proof. You work directly with me from the initial scope through the build instead of being handed from sales to an account layer that never touches the work.'
if old_about in t:
    t = t.replace(old_about, new_about, 1)

old_footer = '<footer class="site-footer"><div class="shell footer-inner"><div class="footer-brand"><span class="brand-badge brand-badge-sm"><img src="assets/brand/rp-monogram.png" alt="" width="320" height="320" loading="lazy" decoding="async"></span><span class="brand-name">Revenue Pilots</span></div><p class="footer-contact"><a href="/about/">About me</a> · <a href="#contact">Ask a question</a></p><p class="footer-disclosure">Websites, video creative and customer systems. Ad spend not included. No performance guarantee.</p><p class="footer-copy">&copy; <span id="year">2026</span> Revenue Pilots</p></div></footer>'
new_footer = '<footer class="site-footer"><div class="shell footer-inner"><div class="footer-brand"><span class="brand-badge brand-badge-sm"><img src="assets/brand/rp-monogram.png" alt="" width="320" height="320" loading="lazy" decoding="async"></span><span class="brand-name">Revenue Pilots</span></div><p class="footer-contact"><a href="/about/">About me</a> · <a href="#contact">Ask a question</a></p><p class="footer-disclosure">Founder-led · Charlotte / Fort Mill · Secure checkout by Stripe · Third-party subscriptions and ad spend separate when required · No performance guarantee.</p><p class="footer-copy">&copy; <span id="year">2026</span> Revenue Pilots</p></div></footer>'
if old_footer in t:
    t = t.replace(old_footer, new_footer, 1)

p.write_text(t, encoding='utf-8')

# Fail loudly if any critical piece did not land.
checks = [
    'css/trust-conversion.css',
    'rp-trust-grid',
    'A working concept, not a static mockup.',
    'rp-system-case',
    'term=deposit',
    '$1,750 to start',
    'Know exactly what happens next.',
    'id="faq"',
    'A serious project should feel clear before it starts.'
]
for needle in checks:
    if needle not in t:
        raise SystemExit(f'missing expected final marker: {needle}')
print('final homepage trust/conversion pass applied')
