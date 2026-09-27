# Sentinal Research & Sentinal Product — Website

Static site for **Sentinal Research** and the **Sentinal** product page. Plain HTML, CSS and JS: no build step and no dependencies.

```
index.html            Sentinal Research landing page (mission, research scroll stage, projects)
sentinal/index.html   Sentinal product page ("Know more →" from Sentinal Research)
404.html              Not-found page
assets/               site.css, research.js, sentinal.css, sentinal.js, favicons, og images
.nojekyll             Tells GitHub Pages to serve files as-is
```

## Publish on GitHub Pages
1. Push these files to the `main` branch of your GitHub repository.
2. In the repo, go to **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**.

## Local preview
```bash
npx serve .    # or: python3 -m http.server
```
