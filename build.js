const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

async function getPlotData() {
  const token = process.env.GITHUB_TOKEN;
  const user = "aanunez";
  const size = 100;
  const search = "https://api.github.com/search/commits?q=";

  const defaultPlot = "0,100 20,100 40,100 60,100 80,100 100,100 120,100 140,100 160,100 180,100 200,100 220,100 240,100 260,100 280,100 300,100 320,100 340,100 360,100 380,100 400,100 420,100 440,100 460,100 480,100 500,100 520,100 540,100 560,100 580,100 600,100";

  let existingData = defaultPlot;
  const plotJsonPath = path.join(ROOT, 'plot.json');
  if (fs.existsSync(plotJsonPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(plotJsonPath, 'utf8'));
      if (parsed?.data) existingData = parsed.data;
    } catch {}
  }

  if (!token) {
    console.log('[build] GITHUB_TOKEN not provided; using cached/default commit plot.');
    return existingData;
  }

  try {
    let page = 1;
    let total = 9999;
    const history = new Proxy({}, {
      get: (target, name) => (target.hasOwnProperty(name) ? target[name] : 0),
    });

    const today = new Date();
    const tz = today.getTimezoneOffset() * 60 * 1000;
    let date = new Date(new Date().setDate(today.getDate() - 30 - 1) - tz);
    let ymd = date.toISOString().split('T')[0];

    while ((size * page) <= (Math.ceil(total / size) * size)) {
      const res = await fetch(`${search}author:${user}+author-date:>${ymd}&per_page=${size}&page=${page}`, {
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "aanunez-build-script",
        },
      });

      if (!res.ok) {
        throw new Error(`GitHub API responded with ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data?.items || !Array.isArray(data.items)) {
        throw new Error(`Unexpected GitHub API response: ${JSON.stringify(data).slice(0, 100)}`);
      }

      total = data.total_count;
      for (const entry of data.items) {
        const t = new Date(new Date(entry.commit.author.date).getTime() - tz);
        history[t.toISOString().split("T")[0]] += 1;
      }
      page += 1;
    }

    const counts = Object.values(history);
    const maxVal = counts.length > 0 ? Math.max(...counts) : 1;
    const scale = 100 / (maxVal || 1);
    const svgplot = [];
    let count = 0;

    while (count <= 30) {
      date = new Date(new Date(date).setDate(date.getDate() + 1));
      ymd = date.toISOString().split('T')[0];
      const score = Math.floor(100 - (history[ymd] * scale));
      svgplot.push(`${20 * count},${score}`);
      count += 1;
    }

    const plotData = svgplot.join(" ");
    fs.writeFileSync(plotJsonPath, JSON.stringify({ data: plotData }, null, 2));
    console.log('[build] Updated plot.json from GitHub commit history.');
    return plotData;
  } catch (err) {
    console.warn(`[build] Failed to fetch GitHub commit history: ${err.message}. Using fallback.`);
    return existingData;
  }
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  const startTime = Date.now();
  console.log('[build] Building static site...');

  const plotData = await getPlotData();

  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });

  if (fs.existsSync(PUBLIC)) {
    copyDirRecursive(PUBLIC, DIST);
  }

  // Compile Tailwind CSS with full package
  try {
    execSync('npx @tailwindcss/cli -i style.css -o dist/style.css --minify', {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } catch (err) {
    console.error('[build] Failed to compile Tailwind CSS:', err.message);
    process.exit(1);
  }

  fs.copyFileSync(path.join(ROOT, 'main.js'), path.join(DIST, 'main.js'));
  fs.writeFileSync(path.join(DIST, 'plot.json'), JSON.stringify({ data: plotData }, null, 2));

  // Process index.html
  let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (!indexHtml.includes('style.css')) {
    indexHtml = indexHtml.replace('</head>', '  <link rel="stylesheet" href="/style.css">\n</head>');
  }
  indexHtml = indexHtml.replace(
    /<script type="module" src="\/main\.ts"><\/script>/,
    '<script src="/main.js" defer></script>'
  );
  fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml);

  // Process contracts.html
  let contractsHtml = fs.readFileSync(path.join(ROOT, 'contracts.html'), 'utf8');
  if (!contractsHtml.includes('style.css')) {
    contractsHtml = contractsHtml.replace('</head>', '  <link rel="stylesheet" href="/style.css">\n</head>');
  }
  contractsHtml = contractsHtml.replace(
    /<script type="module" src="\/main\.ts"><\/script>/,
    '<script src="/main.js" defer></script>'
  );
  // Pre-render SVG points
  contractsHtml = contractsHtml.replace(
    /id="ghline"([^>]*?)points="[^"]*"/,
    `id="ghline"$1points="${plotData}"`
  );
  fs.writeFileSync(path.join(DIST, 'contracts.html'), contractsHtml);

  console.log(`[build] Site built successfully in ${Date.now() - startTime}ms -> dist/`);
}

if (require.main === module) {
  build().catch(err => {
    console.error('[build] Error building site:', err);
    process.exit(1);
  });
}

module.exports = { build, getPlotData };
