# assets/engine — provenance

Prepared for the 2.5D hero integration. Nothing here is wired into the site yet.

## engine-world-*.jpg
Source: `engine-world-4800x2700.jpg`, supplied by the owner in
`Revenue_Pilots_2_5D_Integration_Assets.zip`.

Two modifications were made to the supplied file, both approved:

1. **Cropped 4800x2700 -> 4800x2510.** The bottom ~190px of the supplied plate
   contained a corrupted band of red/green dithered noise (a generation
   artifact). The cut line was chosen by measuring per-row high-frequency
   speckle: the clean floor sits at 0.9-1.3, and the artifact begins climbing
   at y~2525. Cutting at 2510 removes it entirely while keeping all usable floor.

2. **Removed a generated emblem from the hub's gold plate**, at
   x 2288-2528, y 1402-1462 in original coordinates. The supplied plate carried
   a faint embossed pseudo-emblem that is not the Revenue Pilots mark; brand
   locks prohibit any invented emblem appearing in the scene. It was replaced by
   interpolating clean plate tone horizontally across the region (endpoints
   averaged over +/-3 rows to avoid banding, grain matched to the local
   amplitude of 1.0, 7px vertical feather). The real
   `assets/brand/rp-monogram.png` will be composited on this plate at
   integration time -- the emblem is removed outright rather than merely
   covered.

The baked `REVENUE ENGINE` rim text is intentionally preserved: it is the
company's own concept name, not an invented claim.

Derivatives are Lanczos-scaled at JPEG q3. WebP versions are deliberately
deferred until display sizes are fixed at integration time.

## northline-screen-*.jpg
A 16:10 capture of our own `/work/northline-hvac/` concept page at
1280x800 @2x (2560x1600), for compositing into the website module's screen.
This is Revenue Pilots' own page and carries its own on-page disclosure
("CONCEPT / SPEC WEBSITE BUILD - FICTIONAL BUSINESS, MADE BY REVENUE PILOTS").
No third-party content, no client work, no invented metrics.

## Not included
The two supplied module PNGs (`video-module`, `website-module`) are omitted:
they are being re-rendered in the photoreal style of the world plate and the
flat line-art versions are superseded.
