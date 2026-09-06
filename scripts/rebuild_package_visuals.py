from pathlib import Path

p = Path('home-v2.html')
t = p.read_text()

css_link = '<link rel="stylesheet" href="css/package-capabilities.css">'
if css_link not in t:
    anchor = '<link rel="stylesheet" href="css/final-showcase.css">'
    if anchor not in t:
        raise SystemExit('CSS link anchor not found')
    t = t.replace(anchor, anchor + '\n' + css_link, 1)

old_web = '''            <div class="v4-pkg-media v4-pkg-media-mini">
              <span class="rp-altura-mount" data-altura-size="xs" data-altura-canvas="false" role="img" aria-label="ORVYN, a fictional concept website demonstrating premium composition" aria-hidden="true"></span>
            </div>'''
new_web = '''            <div class="v4-pkg-media v4-pkg-media-mini v4-capability v4-capability-web">
              <div class="v4-capability-bar">
                <span class="v4-capability-status"><i aria-hidden="true"></i> Interactive concept</span>
                <a href="demo/altura/" target="_blank" rel="noopener">Open live demo &#8599;</a>
              </div>
              <div class="v4-web-showcase" aria-label="Responsive website concept shown on desktop and mobile">
                <div class="v4-web-desktop">
                  <div class="v4-web-browserbar" aria-hidden="true"><span></span><span></span><span></span><b>orvyn / operations</b></div>
                  <span class="rp-altura-mount" data-altura-size="xs" data-altura-canvas="false" role="img" aria-label="ORVYN, a fictional interactive website concept"></span>
                </div>
                <div class="v4-web-phone" aria-hidden="true">
                  <span class="v4-web-phone-notch"></span>
                  <div class="v4-web-phone-screen">
                    <b>ORVYN</b>
                    <span class="v4-phone-kicker">AUTOMATION LAYER</span>
                    <strong>Move work<br>without friction.</strong>
                    <span class="v4-phone-copy"></span>
                    <span class="v4-phone-cta">Explore</span>
                    <span class="v4-phone-core"><i></i><i></i><i></i></span>
                  </div>
                </div>
              </div>
              <div class="v4-capability-tags" aria-label="Website capabilities">
                <span>Responsive UI</span><span>Motion + interaction</span><span>Conversion path</span><span>Lead capture</span>
              </div>
            </div>'''

if old_web not in t:
    raise SystemExit('Website package visual pattern not found')
t = t.replace(old_web, new_web, 1)

sys_pane = t.index('data-pkg-pane="systems"')
start = t.index('            <div class="v4-pkg-media v4-pkg-media-mini">', sys_pane)
end = t.index('            <div class="v4-pkg-tiers">', start)
new_sys = '''            <div class="v4-pkg-media v4-pkg-media-mini v4-capability v4-capability-system">
              <div class="v4-capability-bar">
                <span class="v4-capability-status"><i aria-hidden="true"></i> Automation flow</span>
                <span class="v4-capability-meta">Trigger &#8594; action &#8594; handoff</span>
              </div>
              <div class="v4-sys-flow" role="img" aria-label="Example Revenue System flow: a new enquiry is captured, followed up, moved to booking and synced to the pipeline">
                <span class="v4-sys-signal" aria-hidden="true"></span>
                <div class="v4-sys-row">
                  <span class="v4-sys-step">01</span>
                  <div class="v4-sys-card"><small>TRIGGER</small><b>New enquiry</b><span>Website form / campaign</span></div>
                  <em>Captured</em>
                </div>
                <div class="v4-sys-row">
                  <span class="v4-sys-step">02</span>
                  <div class="v4-sys-card"><small>ACTION</small><b>Instant follow-up</b><span>Confirmation + owner alert</span></div>
                  <em>Sent</em>
                </div>
                <div class="v4-sys-row">
                  <span class="v4-sys-step">03</span>
                  <div class="v4-sys-card"><small>NEXT STEP</small><b>Booking</b><span>Move interest into an appointment</span></div>
                  <em>Ready</em>
                </div>
                <div class="v4-sys-row">
                  <span class="v4-sys-step">04</span>
                  <div class="v4-sys-card"><small>HANDOFF</small><b>Pipeline synced</b><span>Customer + stage stay organized</span></div>
                  <em>Recorded</em>
                </div>
              </div>
              <div class="v4-capability-tags" aria-label="System capabilities">
                <span>Lead capture</span><span>Follow-up</span><span>Booking</span><span>CRM / pipeline</span>
              </div>
            </div>
'''
t = t[:start] + new_sys + t[end:]

t = t.replace('''                  <li>Custom visual direction</li>
                  <li>Responsive build</li>
                  <li>Conversion architecture</li>
                  <li>Lead capture</li>
                  <li>Basic integrations</li>''', '''                  <li>Custom visual direction</li>
                  <li>Responsive desktop + mobile build</li>
                  <li>Motion and interaction where it adds value</li>
                  <li>Conversion architecture + lead capture</li>
                  <li>Core integrations</li>''', 1)

t = t.replace('''                  <li>Lead capture workflow</li>
                  <li>Automated follow-up</li>
                  <li>Booking integration</li>
                  <li>Pipeline / basic CRM</li>
                  <li>Core automation</li>''', '''                  <li>Lead capture + routing</li>
                  <li>Automated follow-up</li>
                  <li>Booking integration</li>
                  <li>Pipeline / CRM handoff</li>
                  <li>Core workflow automation</li>''', 1)

p.write_text(t)
