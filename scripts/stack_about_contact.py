from pathlib import Path

path = Path('css/v4.css')
css = path.read_text(encoding='utf-8')
marker = '/* ABOUT / CONTACT SEPARATION — Sep 6 */'
block = r'''

/* ABOUT / CONTACT SEPARATION — Sep 6
   About is editorial/trust content; the lead form is a separate decision moment.
   Do not present "who we are" and "give us your information" as competing columns. */
#about .contact-grid{
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:clamp(62px,8vw,96px);
  max-width:1080px;
  margin-inline:auto;
}
#about .v2-about-copy{
  width:min(100%,820px);
  margin-inline:auto;
  text-align:left;
}
#about .v2-about-copy .v2-lead{
  max-width:13ch;
}
#about .v2-about-copy .v2-body{
  max-width:680px;
}
#about .contact-form-wrap{
  position:relative;
  width:min(100%,860px);
  margin-inline:auto;
  padding:clamp(28px,4vw,42px);
  border-color:rgba(255,255,255,.12);
  background:
    radial-gradient(75% 85% at 18% 0%,rgba(197,154,60,.075),transparent 62%),
    rgba(10,13,18,.92);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 30px 80px rgba(0,0,0,.34);
}
#about .contact-form-wrap::before{
  content:"START A CONVERSATION";
  display:block;
  margin-bottom:12px;
  color:var(--gold);
  font-size:10px;
  font-weight:800;
  letter-spacing:.17em;
}
#about .contact-form-wrap .form-heading{
  font-size:clamp(24px,2.5vw,32px);
  margin-bottom:28px;
}
@media(max-width:760px){
  #about .contact-grid{gap:52px;}
  #about .contact-form-wrap{padding:22px 18px;}
  #about .contact-form-wrap::before{margin-bottom:9px;}
}
'''

if marker not in css:
    path.write_text(css.rstrip() + block + '\n', encoding='utf-8')
    print('appended about/contact separation styles')
else:
    print('styles already present')
