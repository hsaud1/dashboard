# ◈ DataBoard Pro

> A stunning, fully interactive data dashboard built with pure HTML, CSS & JavaScript — zero dependencies, zero frameworks.

---

## ✨ Features

### 📊 Live Charts
- **Bar Chart** — Monthly revenue with hover tooltips, built on HTML Canvas
- **Donut Chart** — Traffic sources breakdown with interactive legend
- **Sparklines** — Mini trend graphs inside every KPI card

### 🃏 KPI Cards
- **Click any card** to instantly edit its value
- Animated count-up on load
- Color-coded trend badges (▲ up / ▼ down)

### 🗂️ 4 Navigation Pages
| Page | What it does |
|------|-------------|
| Dashboard | Overview with charts & KPIs |
| Analytics | Auto-refreshing live stats (every 5s) |
| Transactions | Full CRUD table with search |
| Goals | Progress bars with custom colors |

### 🎛️ Full Interactivity
- ➕ **Add** transactions, goals, and update KPIs via modals
- ✕ **Delete** any transaction or goal
- ✎ **Edit** bar chart data month-by-month
- ✎ **Edit** donut chart source percentages
- 🔍 **Search** transactions in real time
- 🔔 **Notifications** panel — auto-fills on every action
- 👤 **Edit your profile** (name, role, initials)
- ☰ **Collapsible sidebar**

---

## 🛠️ Tech Stack

| Tech | Usage |
|------|-------|
| HTML5 | Semantic structure, Canvas elements |
| CSS3 | Custom properties, Grid, Flexbox, Animations |
| Vanilla JS | All logic, chart rendering, state management |

**No npm. No webpack. No React. Just open and run.**

---

## 📁 Project Structure

```
databoard-pro/
├── index.html     ← HTML structure & layout
├── style.css      ← All styles, themes, animations
├── script.js      ← All interactivity & chart logic
└── README.md      ← You are here
```

---

## 🚀 Getting Started

### Option 1 — Clone & Open
```bash
git clone https://github.com/YOUR_USERNAME/databoard-pro.git
cd databoard-pro
```
Then just open `index.html` in your browser. Done! ✅

### Option 2 — Live Server (recommended for dev)
```bash
# Using VS Code's Live Server extension
# Right-click index.html → "Open with Live Server"
```

---

## 🎨 Customization

### Change colors
Edit CSS variables at the top of `style.css`:
```css
:root {
  --emerald: #00f5a0;   /* primary accent */
  --rose:    #ff5f7e;   /* danger/expenses */
  --amber:   #ffbe3d;   /* warning/users */
  --sky:     #38bdf8;   /* info/sessions */
}
```

### Change default data
Edit the `state` object at the top of `script.js`:
```js
const state = {
  kpi:          { revenue: 84250, expenses: 31800, ... },
  barData:      [52, 61, 48, 70, ...],  // monthly values
  donutData:    [{ label: 'Organic', value: 38, color: '...' }, ...],
  transactions: [...],
  goals:        [...],
};
```

---

## 🖱️ User Interactions Cheat Sheet

| Action | How to do it |
|--------|-------------|
| Update a KPI | Click the KPI card |
| Edit bar chart | Click ✎ on the Revenue chart |
| Edit donut chart | Click ✎ on Traffic Sources |
| Add a transaction | Click **＋ Add Data** → Transaction |
| Delete a transaction | Click **✕ Delete** on any row |
| Search transactions | Type in the search bar |
| Add a goal | Click **＋ Add Goal** on Goals page |
| Change year on chart | Use the year dropdown |
| Edit your profile | Click your name/avatar in sidebar |
| View notifications | Click the 🔔 bell icon |
| Collapse sidebar | Click ☰ in the top bar |

---

## 📸 Design

- 🌑 Dark theme with glowing neon accents
- 🌀 Animated floating background orbs
- 🔤 Typography: **Outfit** + **JetBrains Mono**
- 📐 Responsive — adapts to mobile & tablet
- ⚡ Smooth CSS animations & micro-interactions throughout

---

## 📝 License

MIT — free to use, modify, and share.

---

<div align="center">
  Built with ❤️ using zero dependencies
</div>



