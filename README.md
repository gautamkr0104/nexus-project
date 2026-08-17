# ⚡ NEXUS — Student Universe

A gamified student productivity dashboard built with vanilla HTML, CSS, and JavaScript. Track missions, manage focus sessions, organize notes, and level up as you learn.

![NEXUS Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 📊 Dashboard
- Personalized greeting based on time of day
- XP & level progression system with animated progress bar
- Daily motivational quotes and random knowledge facts
- At-a-glance stats: missions completed, focus minutes, streak, XP earned

### 🎯 Mission System
- Create missions with subject, difficulty (Easy/Medium/Hard), and estimated time
- Earn XP based on difficulty: Easy (20 XP), Medium (40 XP), Hard (75 XP)
- Filter missions by All / Active / Completed
- Dashboard quick-view of active missions

### ⏱️ Focus Mode (Pomodoro Timer)
- Customizable focus and break durations
- Circular animated countdown timer
- Pause, resume, and reset controls
- Earn XP proportional to focus time
- Motivational quotes during sessions

### 📚 Subjects
- Add custom subjects with emoji icons
- Track completion progress (0–100%)
- Color-coded progress bars
- See per-subject mission count and analytics

### 📝 Notes
- Rich note creation with title and content
- Edit and delete notes inline
- Search notes by title or content

### 📈 Analytics
- Total XP, level, best streak, missions done, focus minutes
- Weekly activity bar chart
- Subject progress breakdown

### 🎮 Gamification
- XP-based leveling system (Level N requires N×100 XP)
- 10+ level titles from *Curious Starter* to *Universal Mind*
- Animated level-up overlay with confetti
- Daily streak tracking

### 🌓 Themes
- Dark mode (default) and light mode
- Glassmorphism card design with gradient accents
- Animated background radial gradients

### 📱 Responsive Design
- Full mobile support with hamburger menu sidebar
- Adaptive grid layouts for all screen sizes
- Touch-friendly controls

## 🚀 Getting Started

No build tools or dependencies required — just open `index.html` in a browser.

### Quick Start
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/nexus-project.git

# Open in browser
cd nexus-project
open index.html    # macOS
start index.html   # Windows
xdg-open index.html # Linux
```

## 🗂️ Project Structure

```
nexus-project/
├── index.html      # Main HTML structure (all pages, modals, overlays)
├── style.css       # Complete stylesheet (themes, responsive, animations)
├── script.js       # Application logic (data, UI, timer, XP system)
└── README.md       # This file
```

## 💾 Data Storage

All data is stored in **localStorage** under the `nexusData` key. This includes:
- User profile (name, XP, level, streak)
- Missions, subjects, and notes
- Activity history for charts and streak tracking
- Settings (theme, timer durations, sound effects)

### Export / Import
- **Export**: Download all data as a timestamped JSON file from Settings
- **Import**: Restore from a previously exported JSON file

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close any open modal or sidebar |
| `Ctrl/⌘ + K` | Focus the search input |
| `Ctrl/⌘ + Enter` | Add mission (when focused on mission title) |

## 🎯 XP & Leveling

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 100 | Curious Starter |
| 2 | 200 | Eager Learner |
| 3 | 300 | Knowledge Explorer |
| 4 | 400 | Brain Builder |
| 5 | 500 | Mind Architect |
| 6 | 600 | Wisdom Seeker |
| 7 | 700 | Scholar Prodigy |
| 8 | 800 | Intellectual Giant |
| 9 | 900 | Grandmaster |
| 10 | 1000 | Universal Mind |
| 11+ | — | Legendary Scholar |

## 🛠️ Customization

### Adding Subjects
Go to **Subjects** → enter a name and emoji icon → click **Add**.

### Changing Timer Defaults
Go to **Settings** → adjust Focus/Break durations → click **Save Settings**.

### Resetting Data
Go to **Settings** → **Reset All Data** → confirm. This clears all missions, notes, subjects, and progress.

## 📋 Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (Chrome, Safari)

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

Built with ❤️ for students who want to level up their learning.
