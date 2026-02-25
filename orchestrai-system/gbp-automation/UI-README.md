# GBP Post Review Dashboard

A beautiful, production-ready web interface for reviewing and managing Google Business Profile posts.

## 🎨 Design Features

- **ShadCN UI Components**: Professional, accessible components built on Radix UI
- **MagicUI Animations**: Eye-catching effects including:
  - RetroGrid animated background
  - NumberTicker for stats
  - ShimmerButton for CTAs
  - BorderBeam for card highlights
- **Custom Typography**: Bricolage Grotesque (display), Inter (body), JetBrains Mono (code)
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Color-coded Statuses**: Visual indicators for draft, approved, published, failed states

## 🚀 Quick Start

### Option 1: Automatic (Recommended)

```bash
# From gbp-automation directory
./start-dev.sh
```

This will:
1. Initialize database if needed
2. Install all dependencies
3. Start API server (http://localhost:3001)
4. Start UI development server (http://localhost:5173)

### Option 2: Manual

```bash
# Terminal 1: Start API Server
npm run server

# Terminal 2: Start UI
npm run ui
```

## 📁 Project Structure

```
gbp-automation/
├── ui/                          # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # ShadCN UI components
│   │   │   ├── magicui/        # MagicUI animation components
│   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   └── PostModal.jsx   # Edit modal
│   │   ├── api/
│   │   │   └── posts.js        # API service layer
│   │   ├── hooks/
│   │   │   └── use-toast.js    # Toast notification hook
│   │   ├── lib/
│   │   │   └── utils.js        # Utility functions
│   │   ├── App.jsx             # Main app component
│   │   └── index.css           # Global styles + Tailwind
│   ├── package.json
│   └── tailwind.config.js
├── server.js                    # Express API server
├── database/                    # SQLite database
└── start-dev.sh                 # Development startup script
```

## 🎯 Features

### Dashboard
- **Stats Bar**: Real-time counts with animated NumberTicker
- **Advanced Filters**: Status, Type, Language, Search
- **Bulk Actions**: Select multiple posts, bulk approve
- **Export**: Download posts as CSV

### Posts Table
- **Visual Status Badges**: Color-coded for quick recognition
- **Character Count**: Real-time validation (100-1500 chars)
- **Quick Actions**: Approve, Reject, Edit from table
- **Click to Edit**: Click any row to open edit modal

### Edit Modal
- **Full Post Editing**: Title, content, type, category, tags, language
- **Schedule Posts**: Set future publish dates
- **Quality Gates**:
  - Character limit validation (100-1500)
  - AI detection score display
- **Real-time Feedback**: Character counter with percentage
- **Approve/Reject**: Workflow actions from modal

## 🔌 API Endpoints

The backend API server provides:

```
GET    /api/posts              - List posts with filters
GET    /api/posts/:id          - Get single post
PUT    /api/posts/:id          - Update post
POST   /api/posts/:id/approve  - Approve post
POST   /api/posts/:id/reject   - Reject post
POST   /api/posts/bulk-approve - Bulk approve
GET    /api/stats              - Get statistics
POST   /api/export-csv         - Export to CSV
```

## 🎨 Component Library

### ShadCN UI Components Used
- Button
- Badge
- Table
- Dialog (Modal)
- Select (Dropdown)
- Input
- Textarea
- Card
- Checkbox
- Toast (Notifications)

### MagicUI Components
- **RetroGrid**: Animated 3D grid background
- **NumberTicker**: Smooth animated number counters
- **ShimmerButton**: Gradient shimmer effect on buttons
- **BorderBeam**: Rotating gradient border animation

## 🛠️ Development

### Install Dependencies

```bash
# Backend
npm install

# Frontend
cd ui && npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` is required due to React 19 peer dependency conflicts with some libraries.

### Available Scripts

```bash
npm run server      # Start API server only
npm run dev         # Start API server with auto-reload
npm run ui          # Start UI development server only
npm run init        # Initialize database
npm run test        # Test database connection
```

## 🎯 Usage Workflow

1. **Generate Posts**: Use the generation pipeline to create draft posts
   ```bash
   npm run generate
   ```

2. **Review**: Open UI dashboard at http://localhost:5173
   - View all posts with filters
   - Click a post to edit details
   - Check quality gates (character limit, AI detection)

3. **Approve**:
   - Single: Click "Approve" button on post
   - Bulk: Select multiple, click "Approve Selected"

4. **Publish**: Use the publishing workflow to send to GoHighLevel
   ```bash
   npm run publish
   ```

5. **Export**: Download approved posts as CSV for records

## 🎨 Customization

### Colors
Edit `ui/src/index.css` CSS variables:
```css
--primary: 262 83% 58%;        /* Purple primary color */
--background: 40 20% 99%;      /* Warm ivory background */
```

### Fonts
Modify `ui/tailwind.config.js`:
```js
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["Bricolage Grotesque", "sans-serif"],
  mono: ["JetBrains Mono", "monospace"],
}
```

### Animations
Adjust timing in `ui/tailwind.config.js`:
```js
animation: {
  shimmer: "shimmer 8s infinite",
  "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Locked
```bash
# Restart the server
# Database uses WAL mode for concurrent access
```

### React Peer Dependency Warnings
```bash
# Use --legacy-peer-deps flag
cd ui && npm install --legacy-peer-deps
```

### Missing Dependencies
```bash
# Reinstall all dependencies
npm install
cd ui && npm install --legacy-peer-deps
```

## 📦 Production Build

```bash
# Build UI for production
cd ui && npm run build

# Serve built files (you'll need to configure Express to serve static files)
```

## 🚀 Next Steps

1. **Authentication**: Add user login/auth
2. **Real-time Updates**: WebSocket for live post updates
3. **Image Upload**: Add image support for posts
4. **Analytics**: Track post performance
5. **Scheduling**: Visual calendar for scheduled posts
6. **Templates**: Save and reuse post templates

## 🎉 Features Highlight

- ✨ Beautiful, professional design
- 🎨 MagicUI animations throughout
- 📱 Fully responsive mobile design
- ⚡ Fast, optimized performance
- ♿ Accessible (WCAG compliant)
- 🎯 Quality gates validation
- 📊 Real-time statistics
- 🔍 Advanced filtering
- ✅ Bulk operations
- 📥 CSV export

## 📝 License

MIT - Part of the ORCHESTRAI System
