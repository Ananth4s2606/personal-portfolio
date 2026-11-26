# Anantharaj S — Portfolio

A static portfolio site: plain HTML, CSS and JavaScript. No build step, no frameworks, no runtime dependencies.

## Run it locally

Easiest: double-click `index.html`. Everything (fonts, icons, the PID demo) works straight from disk.

Or serve the folder, which behaves like a real deployment:

```bash
cd Anantharaj_Portfolio
python3 -m http.server 8000      # then open http://localhost:8000
```

## Deploy

Upload the folder as it is to Vercel, Netlify or GitHub Pages. There is nothing to build.

After you know your live address, change the `og:image` line in the `<head>` of each page from `og-image.png` to the full address (for example `https://your-site.vercel.app/og-image.png`). Social networks need the full address to show the preview card.

## Structure

```
index.html                 Home: hero + PID bench, projects, about, skills, education, contact
projects/
  eyantra.html             Khoj-O-Drone
  skillbridge-ai.html      SkillBridge AI
  aesra.html               AESRA
  personal-portfolio.html  Personal Portfolio Website
style.css                  All styling. Colours, radii and widths are tokens at the top of the file
script.js                  Menu, active nav link, contact form, PID bench
assets/                    Project images (WebP, 800 px and 1400 px) and the font
assets/fonts/archivo.css   Archivo font, embedded so it also loads from file://
Anantharaj_S_Resume.pdf    Resume (linked from the header, hero and footer)
profile*.webp, favicon.png, apple-touch-icon.png, og-image.png
```

## Editing

- Text lives directly in the HTML files. Search for what you want to change.
- Colours: `:root` at the top of `style.css`. `--signal` is the yellow, `--ink` the navy, `--paper` the page background.
- Skill levels: each skill has a three-step meter, e.g. `<i class="on"></i><i class="on"></i><i></i>` is Intermediate. Change the number of `class="on"` bars and the label next to it.
- Contact email: it appears in `index.html` (the `mailto:` link, the copy button and `data-to` on the form).
- PID demo defaults: `DEFAULTS` in `script.js` and the `value` attributes of the three sliders in `index.html`.
- New project page: copy any file in `projects/`, edit it, then add a card in `index.html` and update the "Next project" link.

## What the contact form does

The site has no server, so the form opens the visitor's email app with the message filled in. If nothing opens, a link to write it in Gmail and a button to copy your address appear. Nothing is stored.

## About the PID bench in the hero

A drone chases a marker with a real PID controller: `u = Kp·e + Ki·∫e dt − Kd·v`, per axis, on a point mass with drag. The integral only accumulates close to the target (anti-windup), motor output is capped, and the wind button adds a steady push so you can see why the integral term matters. The marker is the number 5963 in binary, drawn as a 4×4 ArUco-style grid. The demo pauses when it is off-screen, supports keyboard arrows, and stays still for visitors who prefer reduced motion until they interact.

## Accessibility and performance

- Skip link, visible keyboard focus, labelled form fields with error messages, `aria-live` status messages.
- Mobile menu closes with Escape, traps focus while open and works on every page.
- Text contrast is at least 4.5:1 everywhere.
- Respects `prefers-reduced-motion`.
- Images are WebP with `srcset`; the whole folder is about 1.5 MB, of which the resume PDF and the share image are over a third. The home page itself is roughly 0.5 MB with every image loaded.

## Credits

- Archivo (variable font) by Omnibus-Type, SIL Open Font License 1.1: `assets/fonts/ARCHIVO-OFL-LICENSE.txt`
- Icons from Lucide (ISC license), inlined as SVG.
