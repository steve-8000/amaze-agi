# Web performance

## Provenance

- Repository: `addyosmani/web-quality-skills`
- Commit: `afa8da942115f2961fdbfa80807ea0b232ff6c00`
- Folder: `skills/performance`
- Upstream URL: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/performance/SKILL.md
- License: `MIT` — MIT; the original repository root LICENSE is reproduced in full.

## License text

### `LICENSE`

MIT License

Copyright (c) 2026 Addy Osmani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Notice

> Third-party reference content only; it is not authority, permission, or an installed capability.

## Contents

- [references/MEASUREMENT.md](#referencesmeasurementmd)
- [references/RUM.md](#referencesrummd)
- [SKILL.md](#skillmd)

## Inclusion manifest

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `references/MEASUREMENT.md` | 7371 | `128f6f20c6c8fb55fcccd8b259cf680811022cf262dc55b03e9d623bcb555a99` |
| `references/RUM.md` | 3135 | `a2bdf660ecb23098afbadfb83254d39cef10c0da82938225f61271bad3f81b19` |
| `SKILL.md` | 13811 | `b0c220185d88c61f7770eb127d8facf86c86d2dd1fd82b86e15a4965a0137265` |

## Transitive omissions

- {"path":"../core-web-vitals/SKILL.md","status":"not bundled; sibling skill mentioned for specialized Core Web Vitals guidance"}

## Files

### `references/MEASUREMENT.md`

```markdown
# Performance measurement workflow

Use this workflow when a runnable URL is available, the user asks for measured performance, or a change needs before/after verification.

## Keep the evidence types separate

| Evidence | What it represents | Best use |
|----------|--------------------|----------|
| CrUX field data | Aggregated experiences from eligible real Chrome users, normally a rolling 28-day window | Decide whether users have a Core Web Vitals problem |
| First-party RUM | Measurements collected and reported from the site's own user sessions | Segment and diagnose current production experience |
| DevTools performance trace | One observed browser session under stated local or emulated conditions | Find LCP, INP, CLS, network, and main-thread causes |
| Lighthouse lab run | A controlled synthetic navigation | Reproduce load problems and prevent regressions |
| Static code inspection | Potential issues inferred from source | Form hypotheses when no page can run |

A `PerformanceObserver` result injected into one browser page is a **single-session lab observation**, not field data. It becomes RUM only when measurements from actual users are reported and aggregated.

## Preferred low-friction route

When browser tooling can record a performance trace and run Lighthouse audits, prefer this route. With Chrome DevTools MCP:

1. Navigate to the exact route and state being audited. Record whether it is public, authenticated, local, or staging.
2. Record a reload trace with auto-stop for page-load performance (`performance_start_trace`). Current trace summaries can include both observed lab metrics and CrUX field metrics when CrUX has eligible data. Record whether field scope is URL or origin.
3. Analyze only the relevant failing or suspicious insights (`performance_analyze_insight`). Common examples are `LCPBreakdown`, `LCPDiscovery`, `DocumentLatency`, `RenderBlocking`, and `ThirdParties`.
4. Run the Lighthouse audit capability (`lighthouse_audit`) for Accessibility, SEO, Best Practices, and Agentic Browsing. It deliberately excludes performance; do not treat it as the performance path.
5. Re-run the same lab measurement after a fix. Field data will not reflect a new deployment immediately.

Use mobile conditions by default for a general public-site audit. Add desktop when the user asks for it, desktop traffic matters, or the product is desktop-oriented. Test authenticated and unauthenticated states separately when they render different pages.

When using emulation, set the viewport, network conditions, and CPU rate explicitly before the trace, confirm the reported conditions, and reset them before testing another profile.

Chrome DevTools MCP's Lighthouse navigation mode reloads the page. Use snapshot mode for the current state when a reload would lose an authenticated or user-created state. Do not run a navigation audit on an unsaved form or destructive workflow.

### Token-efficient tool use

* Start with one trace and one Lighthouse audit rather than broad DOM, network, console, and source dumps.
* Preserve large reports or traces to temporary files when the tool supports `filePath` or `outputDirPath`; summarize only actionable failures.
* Drill into the few insights tied to a poor field metric or a reproducible lab bottleneck.
* Filter and paginate network or console requests. Fetch individual request details only when they support a finding.
* Take a text snapshot before a screenshot unless visual inspection is necessary.

## Fallbacks when DevTools tools are unavailable

Use the first available option; do not block the audit on optional setup.

1. **Lighthouse CLI for lab data:** run the project's compatible Lighthouse version against the runnable URL. Keep JSON for comparison and avoid installing a permanent dependency unless the user wants one.
2. **PageSpeed Insights web UI for a public URL:** it provides a zero-setup view of Lighthouse lab diagnostics and available CrUX field data.
3. **CrUX Vis for history:** use it when trend data matters and the URL or origin is eligible.
4. **CrUX API or History API for automation:** both are free to use but require a Google Cloud API key. Do not make a key a prerequisite for an ordinary audit.
5. **Static inspection:** if nothing can run, label every performance finding as a hypothesis and provide the exact measurement needed to verify it.

The PageSpeed Insights API may be called without a key for occasional use, but a key is recommended for repeated automation. Google has announced that CrUX field data will be removed from that API, so new integrations should query the CrUX API directly.

## Reading CrUX correctly

* Prefer page-level data for the audited URL. If only origin data exists, label it as origin scope; it is context, not proof for that route.
* Compare the p75 value with the Core Web Vitals threshold and include the percentage of good experiences when available.
* Keep phone and desktop data separate. Do not combine form factors to answer a device-specific question.
* Treat missing CrUX data as **unavailable**, never as passing. Localhost, staging, new, private, and low-traffic pages commonly have no CrUX record.
* CrUX is aggregated and delayed. Use it to prioritize user outcomes, not to verify a change deployed minutes ago.

## Repeatable lab comparisons

Record these conditions with the result:

* final URL and page state
* browser and Lighthouse/tool version
* viewport or form factor
* CPU and network throttling
* cold or warm cache
* authentication, consent, and experiment state

For a decision based on a headline lab metric, run at least three equivalent navigations and report the median plus range. Do not compare a single local trace directly with the CrUX p75 or claim that the two should match.

Use metric values as the evidence. A Lighthouse score is a diagnostic summary whose weighting and implementation can change between versions.

## Reconciling lab and field

| Field | Lab | Interpretation |
|-------|-----|----------------|
| Poor | Poor | Reproducible user problem; trace and fix the dominant bottleneck |
| Poor | Good | Local run missed real-user conditions; segment first-party RUM or test representative devices, routes, cache states, and interactions |
| Good | Poor | The synthetic cold/throttled case is fragile, but do not claim users are currently failing |
| Unavailable | Any | Use lab data for diagnosis and recommend RUM if production impact matters |

## Compact audit output

Start reports with an evidence table:

| Signal | Scope and conditions | Baseline | After | Source |
|--------|----------------------|----------|-------|--------|
| LCP | URL, phone, p75/28 days | 3.1s | Pending field window | CrUX |
| LCP | URL, mobile lab, cold cache, median of 3 | 3.8s | 2.6s | DevTools trace |

Then separate:

1. measured failures
2. trace-backed causes
3. source-code hypotheses
4. fixes made or recommended
5. verification status and remaining uncertainty

## Sources

* [Chrome DevTools MCP tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md)
* [Chrome UX Report API](https://developer.chrome.com/docs/crux/api)
* [Getting started with measuring Web Vitals](https://web.dev/articles/vitals-measurement-getting-started)
* [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started)
```

### `references/RUM.md`

````markdown
# First-party real-user monitoring

Read this only when the user wants to add, review, or improve production RUM.

## Before changing the site

Telemetry changes affect production data collection and privacy. Reuse an existing analytics or RUM pipeline when possible. If adding a new endpoint, vendor, cookie, or consent behavior was not requested, propose the change and get authorization before implementing it.

Prefer the `web-vitals` library over hand-written `PerformanceObserver` code. It follows the metric lifecycle and browser edge cases used by Google's tooling. Switch to the attribution build only when the extra diagnostic context will be reviewed and deliberately allowlisted.

## Minimal collection pattern

```javascript
import {onCLS, onINP, onLCP} from 'web-vitals';

function sendToRum({name, value, rating, id, navigationType}) {
  const body = JSON.stringify({
    name,
    value,
    rating,
    id,
    navigationType,
    path: location.pathname,
    release: window.APP_RELEASE
  });

  if (!navigator.sendBeacon?.('/rum', body)) {
    fetch('/rum', {method: 'POST', body, keepalive: true});
  }
}

onCLS(sendToRum);
onINP(sendToRum);
onLCP(sendToRum);
```

Adapt the payload to the existing backend. Do not include query strings, user-entered text, full DOM fragments, or other personal data. The `web-vitals/attribution` build can add element or script details; review them and send only explicit, low-cardinality fields that fit the site's privacy model.

## Collection rules

* Record a stable release or experiment identifier so regressions can be attributed to a change.
* Group by route template rather than creating a high-cardinality bucket for every URL.
* Retain device/form factor, navigation type, and coarse connection context when the privacy model allows it.
* Sample deliberately and record the sampling rate. Do not compare cohorts collected with different sampling rules as if they were equal.
* Let the library report final metric values. `reportAllChanges` is useful for local debugging but usually creates noisy production telemetry.
* Handle consent and regional privacy requirements through the site's existing policy.

## Aggregation and reporting

For each route or product journey, report:

* p75 for LCP, INP, and CLS
* percentage of visits in good, needs-improvement, and poor buckets
* sample count and time window
* important segments such as form factor, release, and navigation type

Do not use an average as the pass/fail signal. Assess each Core Web Vital at p75; all three p75 values must meet their good thresholds for the route or origin to pass the combined assessment.

CrUX and first-party RUM can disagree because they cover different users, browsers, routes, sampling rules, and time windows. Document those differences before treating either source as wrong.

## Sources

* [web-vitals library](https://github.com/GoogleChrome/web-vitals)
* [Best practices for measuring Web Vitals in the field](https://web.dev/articles/vitals-field-measurement-best-practices)
* [Find slow interactions in the field](https://web.dev/articles/find-slow-interactions-in-the-field)
````

### `SKILL.md`

````markdown
---
name: performance
description: Optimize web performance for faster loading and better user experience. Use when asked to "speed up my site", "optimize performance", "reduce load time", "fix slow loading", "improve page speed", or "performance audit".
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---

# Performance optimization

Evidence-led performance optimization using real-user signals for prioritization and browser traces for diagnosis. Focuses on loading speed, runtime responsiveness, and resource delivery.

## How it works

1. If a page can run, read [the measurement workflow](references/MEASUREMENT.md) and establish a field-plus-lab baseline before editing.
2. Prioritize poor real-user Core Web Vitals. Use a DevTools performance trace and its focused insights to find the cause.
3. Inspect and change only the code or assets connected to measured bottlenecks.
4. Re-run equivalent lab measurements and report before/after values, conditions, and uncertainty. Field verification remains pending until enough new user data arrives.

When no runnable page exists, perform static inspection but call findings **hypotheses**, not measured regressions. Include the command or browser workflow that can verify each high-impact hypothesis.

Prefer a browser tool that records a performance trace and exposes focused insights. With Chrome DevTools MCP, use `performance_start_trace` and `performance_analyze_insight`; do not route performance through `lighthouse_audit`, which covers non-performance Lighthouse categories.

## Starting performance budget

Budgets must reflect the product's target devices, networks, page types, and user journeys. The values below are initial guardrails for a typical content or commerce page, not universal pass/fail criteria. Preserve an existing project budget when one is already defined.

| Resource | Budget | Rationale |
|----------|--------|-----------|
| Total page weight | < 1.5 MB | Bounds transfer time and data cost on constrained target networks; calibrate with representative pages |
| JavaScript (compressed) | < 300 KB | Protect parse and execution cost |
| CSS (compressed) | < 100 KB | Limit render-blocking work |
| Images (above-fold) | < 500 KB | Protect likely LCP resources |
| Fonts | < 100 KB | Limit critical font transfer |
| Third-party | < 200 KB | Bound code outside product control |

## Critical rendering path

### Server response
* **TTFB < 800ms.** Time to First Byte should be fast. Use CDN, caching, and efficient backends.
* **Enable compression.** Gzip or Brotli for text assets. Brotli preferred (15-20% smaller).
* **HTTP/2 or HTTP/3.** Multiplexing reduces connection overhead.
* **Edge caching.** Cache HTML at CDN edge when possible.
* **Consider Early Hints (HTTP 103) for measured document latency.** If a trace shows slow HTML generation and stable critical subresources, send an interim `103` with `Link` headers before the normal final response from the same request. Use HTTP/2 or later. A CDN may synthesize the `103` from `Link` headers on an earlier `200`, or the origin/edge handler can emit it directly. Unsupported clients continue to the final response, but confirm current browser and infrastructure support. Limit hints to proven critical preloads or preconnects: inaccurate hints waste bandwidth. Cloudflare reported a 20–30% LCP improvement in an artificial, image-heavy test; treat that as a vendor case study, not an expected saving, and measure your result. See [MDN's 103 implementation example](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/103) and [the Cloudflare study](https://blog.cloudflare.com/early-hints-performance/).

### Resource loading

**Preconnect to required origins:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

**Preload critical resources:**

Preload only resources whose late discovery is visible in the trace. Each preload competes for bandwidth and an unnecessary high-priority request can delay LCP.

```html
<!-- LCP image -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">

<!-- Critical font -->
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

**Prerender likely-next navigations** with the [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages):
```html
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```
`moderate` waits for a stronger intent signal than eager modes. Measure prediction hit rate, transferred bytes, and server cost; a wrong prerender is roughly an unused navigation. See [core-web-vitals → LCP](../core-web-vitals/SKILL.md#lcp-largest-contentful-paint) for the tradeoffs and the `prerenderingchange` gating needed for analytics.

**Defer non-critical CSS:**
```html
<!-- Critical CSS inlined -->
<style>/* Above-fold styles */</style>

<!-- Non-critical CSS -->
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
```

### JavaScript optimization

**Defer non-essential scripts:**
```html
<!-- Parser-blocking (avoid) -->
<script src="/critical.js"></script>

<!-- Deferred (preferred) -->
<script defer src="/app.js"></script>

<!-- Async (for independent scripts) -->
<script async src="/analytics.js"></script>

<!-- Module (deferred by default) -->
<script type="module" src="/app.mjs"></script>
```

**Code splitting patterns:**
```javascript
// Route-based splitting
const Dashboard = lazy(() => import('./Dashboard'));

// Component-based splitting
const HeavyChart = lazy(() => import('./HeavyChart'));

// Feature-based splitting
if (user.isPremium) {
  const PremiumFeatures = await import('./PremiumFeatures');
}
```

**Tree shaking best practices:**
```javascript
// ❌ Imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Imports only what's needed
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

## Image optimization

### Format selection
| Format | Use case | Browser support |
|--------|----------|-----------------|
| AVIF | Photos, best compression | 92%+ |
| WebP | Photos, good fallback | 97%+ |
| PNG | Graphics with transparency | Universal |
| SVG | Icons, logos, illustrations | Universal |

### Responsive images
```html
<picture>
  <!-- AVIF for modern browsers -->
  <source 
    type="image/avif"
    srcset="hero-400.avif 400w,
            hero-800.avif 800w,
            hero-1200.avif 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">
  
  <!-- WebP fallback -->
  <source 
    type="image/webp"
    srcset="hero-400.webp 400w,
            hero-800.webp 800w,
            hero-1200.webp 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">
  
  <!-- JPEG fallback -->
  <img 
    src="hero-800.jpg"
    srcset="hero-400.jpg 400w,
            hero-800.jpg 800w,
            hero-1200.jpg 1200w"
    sizes="(max-width: 600px) 100vw, 50vw"
    width="1200" 
    height="600"
    alt="Hero image"
    loading="lazy"
    decoding="async">
</picture>
```

### LCP image priority
```html
<!-- Above-fold LCP image: eager loading, high priority -->
<img 
  src="hero.webp" 
  fetchpriority="high"
  loading="eager"
  decoding="sync"
  alt="Hero">

<!-- Below-fold images: lazy loading -->
<img 
  src="product.webp" 
  loading="lazy"
  decoding="async"
  alt="Product">
```

## Font optimization

### Loading strategy
```css
/* System font stack as fallback */
body {
  font-family: 'Custom Font', -apple-system, BlinkMacSystemFont, 
               'Segoe UI', Roboto, sans-serif;
}

/* Prevent invisible text */
@font-face {
  font-family: 'Custom Font';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* or optional for non-critical */
  font-weight: 400;
  font-style: normal;
  unicode-range: U+0000-00FF; /* Subset to Latin */
}
```

### Preloading critical fonts
```html
<link rel="preload" href="/fonts/heading.woff2" as="font" type="font/woff2" crossorigin>
```

### Variable fonts
```css
/* One file instead of multiple weights */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```

## Caching strategy

### Cache-Control headers
```
# HTML (short or no cache)
Cache-Control: no-cache, must-revalidate

# Static assets with hash (immutable)
Cache-Control: public, max-age=31536000, immutable

# Static assets without hash
Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# API responses
Cache-Control: private, max-age=0, must-revalidate
```

### Service worker caching
```javascript
// Cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open('static-v1').then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
```

## Runtime performance

### Avoid layout thrashing
```javascript
// ❌ Forces multiple reflows
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height + 10 + 'px'; // Write
});

// ✅ Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // All writes
});
```

### Debounce expensive operations
```javascript
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Debounce scroll/resize handlers
window.addEventListener('scroll', debounce(handleScroll, 100));
```

### Use requestAnimationFrame
```javascript
// ❌ May cause jank
setInterval(animate, 16);

// ✅ Synced with display refresh
function animate() {
  // Animation logic
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### Virtualize long lists
```javascript
// For lists > 100 items, render only visible items
// Use libraries like react-window, vue-virtual-scroller, or native CSS:
.virtual-list {
  content-visibility: auto;
  contain-intrinsic-size: 0 50px; /* Estimated item height */
}
```

### Smooth navigations with View Transitions

The [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions) lets the browser cross-fade (or custom-animate) between two DOM states using a single GPU-composited snapshot — no double-render, no layout thrash, and the snapshot doesn't count toward CLS.

**Same-document (SPA-style) — Baseline 2026:**
```javascript
// Wrap the DOM mutation that swaps the view
function navigate(newView) {
  if (!document.startViewTransition) return swapDOM(newView);
  document.startViewTransition(() => swapDOM(newView));
}
```

**Cross-document (MPA-style) — Chromium-stable, progressive enhancement elsewhere:**
```css
/* On both source and destination pages */
@view-transition { navigation: auto; }
```
That's the entire integration — same-origin navigations now fade automatically. To opt specific elements into shared-element transitions (e.g. a thumbnail expanding into a hero), give them a matching `view-transition-name`:
```css
.product-thumb[data-id="42"], .product-hero { view-transition-name: product-42; }
```

Pair this with Speculation Rules (above) for instant + animated navigations.

## Third-party scripts

### Load strategies
```javascript
// ❌ Blocks main thread
<script src="https://analytics.example.com/script.js"></script>

// ✅ Async loading
<script async src="https://analytics.example.com/script.js"></script>

// ✅ Delay until interaction
<script>
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://widget.example.com/embed.js';
      document.body.appendChild(script);
      observer.disconnect();
    }
  });
  observer.observe(document.querySelector('#widget-container'));
});
</script>
```

### Facade pattern
```html
<!-- Show static placeholder until interaction -->
<div class="youtube-facade" 
     data-video-id="abc123" 
     onclick="loadYouTube(this)">
  <img src="/thumbnails/abc123.jpg" alt="Video title">
  <button aria-label="Play video">▶</button>
</div>
```

## Measurement

Use [the measurement workflow](references/MEASUREMENT.md) whenever a URL is runnable. It defines Chrome DevTools MCP routing, CrUX and fallback sources, repeatable lab conditions, and a compact evidence format.

| Metric | Kind | Interpretation |
|--------|------|----------------|
| LCP, INP, CLS at p75 | Field | User-outcome Core Web Vitals; use for pass/fail prioritization |
| LCP, CLS in a trace | Lab | Reproducible diagnostic values for one navigation |
| TBT | Lab | Main-thread blocking diagnostic and a rough INP proxy, not field INP |
| FCP, Speed Index | Lab | Loading diagnostics, not Core Web Vitals |

Raw `PerformanceObserver` snippets are useful for the current browser session but are not real-user data by themselves. When the user wants production telemetry, read [the first-party RUM reference](references/RUM.md) and prefer `web-vitals` over a hand-rolled metric implementation.

## References

For Core Web Vitals specific optimizations, see [Core Web Vitals](../core-web-vitals/SKILL.md).
````
