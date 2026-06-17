# PIForge Combo Chart — Free Edition

> A free AVEVA PI Vision custom symbol that overlays a **trend line** and **bar series** on a single chart.

[![PIForge](https://img.shields.io/badge/PIForge-piforge.pages.dev-0078d4?style=flat-square)](https://piforge.pages.dev)
[![License](https://img.shields.io/badge/License-Free-27ae60?style=flat-square)]()
[![PI Vision](https://img.shields.io/badge/PI%20Vision-2019%2B-0078d4?style=flat-square)]()

---

## What it does

Displays **two PI tags** side-by-side on the same time axis:

| Stream | Type | Use case |
|--------|------|----------|
| Stream 1 | Trend line | Process value, temperature, flow... |
| Stream 2 | Bar series | Volume, count, batch quantity... |

![Combo Chart Demo](https://piforge.pages.dev/og-image.svg)

---

## Installation

1. **Download** `piforge-combo-chart-demo.zip` from the [Releases](../../releases) page
2. **Extract** all 4 files into your PI Vision extension folder:
   ```
   %PIHOME%\WebApps\PIVision\Scripts\app\editor\symbols\ext\
   ```
3. **Restart** the PI Vision website in IIS (or clear browser cache)
4. Open PI Vision → open a Display → the symbol appears in the palette as **"Combo Chart (Free)"**
5. Drag **two PI tags** onto the symbol — first tag = trend line, second tag = bar series

---

## Configuration

| Option | Description |
|--------|-------------|
| Trend Label / Color | Customize the line appearance |
| Bar Label / Color / Opacity | Customize the bar appearance |
| Show Legend | Toggle chart legend |
| Show Grid | Toggle background grid lines |
| Show Y-Axis | Toggle left axis labels |
| Text / Background Color | Match your display theme |

---

## Free vs Pro

| Feature | Free | [Pro](https://piforge.pages.dev) |
|---------|------|------|
| Trend lines | Up to 3 | Up to 3 |
| Bar series | 1 | Up to 5 |
| Dual Y-axis | ✗ | ✓ |
| Custom time range | ✗ | ✓ |
| Zoom & Pan | ✗ | ✓ |
| Tooltips on click | ✗ | ✓ |
| Data grid table | ✗ | ✓ |
| CSV export | ✗ | ✓ |
| Support | Community | 30-day email support |

👉 **[Get Pro at piforge.pages.dev](https://piforge.pages.dev)**

---

## Requirements

- AVEVA PI Vision 2019 R2 or later
- PI Web API (for Pro version custom time range)
- Modern browser (Chrome, Edge)

---

## License

Free to use in any PI Vision deployment. Redistribution without modification is permitted.  
Commercial support and advanced features available at [piforge.pages.dev](https://piforge.pages.dev).
