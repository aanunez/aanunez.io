# aanunez.io

Zero-dependency personal website built with vanilla HTML/CSS/JS and served via Nginx.

## Development

Runs purely on Node.js built-ins with zero npm packages:

```sh
npm run dev      # Starts local preview server at http://localhost:5173
npm run build    # Builds static site to dist/
```

## Coolify Deployment

Deploy directly using Coolify:

1. **New Resource** -> **Application** -> select this repository.
2. **Build Pack**: Coolify will automatically detect `Dockerfile`.
3. **Ports Exposes**: `80` (Coolify maps this to Traefik with automatic SSL).
4. **Environment / Build Variables** (optional):
   - Add `GITHUB_TOKEN` as a **Build Variable** if you want the commit history sparkline to automatically update on deploy. (If omitted, it uses the cached plot fallback).
