# Wamo Canvas - Project Overview

## Overview

**Wamo Canvas** is a modern, collaborative infinite canvas application built with React and InstantDB. It enables users to create, edit, and collaborate on visual spaces with real-time synchronization. The application supports creating and arranging images, text, and stickers on an infinite canvas, with features like live presence, comments, and flexible access control.

**Key Characteristics:**
- Real-time collaborative editing via InstantDB
- Infinite panning and zooming canvas
- Passwordless authentication with magic codes
- Flexible permission model (private/protected/public canvases)
- Beautiful NEO design system
- Lightweight and performant

---

## Features

### Canvas Features
- ✅ **Infinite Canvas**: Unlimited panning and zooming (0.2x - 3x scale)
- ✅ **Multi-Element Support**: Images, text, and stickers
- ✅ **Rich Editing**: Drag, resize, rotate elements with precision handles
- ✅ **Element Locking**: Prevent accidental edits with lock mechanism
- ✅ **Lasso Tool**: Freeform cropping and selection with point simplification
- ✅ **Connections**: Draw labeled lines between elements
- ✅ **Minimap**: Thumbnail navigation for large canvases
- ✅ **Grid System**: Scale-aware grid background
- ✅ **Clipboard Operations**: Copy/paste elements within canvas

### Content Management
- ✅ **Text Creation**: Magazine-style text generation with random fonts, colors, and rotations
- ✅ **Image Upload**: Public/private image pools for asset management
- ✅ **Sticker Library**: Built-in emoji and sticker support
- ✅ **Element Duplication**: Quick clone elements
- ✅ **Layer Management**: Z-index control (bring to front)

### Collaboration
- ✅ **Real-Time Sync**: Instant synchronization via InstantDB
- ✅ **Live Presence**: Avatar badges showing active editors
- ✅ **Comments**: Comment on elements with author tracking
- ✅ **Canvas Memberships**: Invite users to collaborate
- ✅ **Join to Edit**: Self-serve access for public/protected canvases

### Access Control
- ✅ **Private Canvases**: Owner-only access
- ✅ **Protected Canvases**: Public view, owner edit
- ✅ **Public Canvases**: All users can edit (if logged in)
- ✅ **Element Lock Restrictions**: Creator can bypass locks
- ✅ **Membership-Based Control**: Fine-grained collaboration

### Board Management
- ✅ **Create Boards**: New canvas with visibility settings
- ✅ **Board Listing**: View with metadata (element count, creation date)
- ✅ **Visibility Control**: Change canvas privacy at any time
- ✅ **Delete Boards**: Permanent removal (owner only)
- ✅ **Ownership**: Assign and manage canvas owners

### Authentication
- ✅ **Passwordless Auth**: Email-based magic code flow
- ✅ **Session Persistence**: Auto-restore with token storage
- ✅ **Secure Tokens**: Refresh tokens with expiration
- ✅ **Sign Out**: Clear stored credentials

---

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────┐
│         AppWithAuth (Auth Router)       │
├─────────────────────────────────────────┤
│  Auth Component │ BoardsPage │ App      │
│  (Login Flow)   │ (Boards)   │ (Canvas) │
├─────────────────────────────────────────┤
│           InstantDB Client              │
├─────────────────────────────────────────┤
│    InstantDB Server (Real-time)         │
└─────────────────────────────────────────┘
```

### Component Tree

```
AppWithAuth (Auth Orchestrator)
├── Auth (Passwordless Magic Code Login)
├── BoardsPage (Board Management)
│   ├── BoardCard (Individual Canvas Card)
│   ├── CreateBoardModal (New Canvas Creation)
│   └── SignOutButton
└── App (Main Canvas Application)
    ├── Header (Canvas Name + User Menu)
    │   ├── UserMenu (Avatar + Sign Out)
    │   └── SignInButton (For Non-Auth)
    ├── ActionButtons (Share + Visibility)
    │   ├── SharePopup (QR Code + Copy Link)
    │   └── VisibilityButton (Access Control)
    ├── Toolbar (Tool Selection)
    │   ├── ImageDrawer (Image Pool)
    │   ├── TextDrawer (Text Creation)
    │   ├── StickerDrawer (Sticker Selection)
    │   └── Connection Tool
    ├── Canvas (Infinite Canvas)
    │   ├── CanvasElement (Element Rendering)
    │   │   ├── Resize Handles
    │   │   ├── Rotation Handle
    │   │   ├── Lock Indicator
    │   │   ├── Comments Panel
    │   │   └── Presence Badges
    │   ├── Connection (Element Connections)
    │   ├── ContextMenu (Right-Click Menu)
    │   └── Minimap (Canvas Overview)
    ├── ElementToolbar (Selected Element Actions)
    │   ├── Shuffle Style
    │   ├── Edit / Lasso
    │   ├── Layer Controls
    │   ├── Lock / Duplicate
    │   └── Delete
    └── BottomControls (Zoom + Navigation)
```

### State Management

**React Hooks Pattern:**
- `useState`: Local UI state (dropdown visibility, selected elements, zoom level)
- `useRef`: Imperative handles and caches
- `useEffect`: Side effects and subscriptions
- `useCallback`: Memoized event handlers
- `useMemo`: Complex computations (element sorting, connection preview)

**InstantDB Hooks:**
- `db.useAuth()`: Authentication state
- `db.useQuery()`: Reactive database queries with auto-sync
- `db.useUser()`: Current user information
- `room.usePresence()`: Ephemeral presence data

**No Redux/Context:** Direct InstantDB integration eliminates need for centralized state management.

### Data Flow

```
User Interaction (Mouse/Keyboard)
    ↓
Event Handler (App.jsx)
    ↓
State Update + DB Mutation (db.transact)
    ↓
InstantDB Server (Real-time Sync)
    ↓
All Connected Clients (Auto-Update via useQuery)
    ↓
UI Rerender (React Diff)
```

### Key Interactions

1. **Canvas Creation**
   - User fills create modal → DB mutation → Navigate to new canvas

2. **Element Creation**
   - Select tool → Drag from drawer → Mouse position → Create element → Sync to DB

3. **Element Editing**
   - Click element → Enable resize handles → Drag/rotate → Update DB → Broadcast

4. **Real-Time Collaboration**
   - User A edits element → DB transaction → Room broadcast → User B sees update instantly

5. **Comments**
   - Click element → Open comments → Type + submit → DB mutation → Auto-render

---

## Tech Stack

### Frontend Framework
- **React 19.2.0**: Modern component library with hooks
- **React DOM 19.2.0**: DOM rendering

### Build & Development
- **Vite 7.2.4**: Next-generation build tool with hot reload
- **Bun**: Fast JavaScript runtime and package manager

### Database & Real-time
- **InstantDB 0.22.105**: Real-time database with instant sync
  - Client SDK: Query, mutate, auth, presence
  - Admin SDK: Server-side operations and schema management

### Styling
- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS transformation pipeline
- **Autoprefixer 10.4.23**: Browser vendor prefix automation
- **NEO Design System**: Custom color, shadow, and spacing tokens

### Code Quality
- **ESLint 9.39.1**: JavaScript linting
- **eslint-plugin-react-hooks**: React hooks rules
- **eslint-plugin-react-refresh**: React fast refresh validation

### Type Support
- **TypeScript**: Type definitions for React and React DOM (dev-time only)

---

## Permissions System

### Permission Model

```
Resource        View Access                    Edit Access
────────────────────────────────────────────────────────────
Private         Owner only                     Owner only
Protected       Owner + Members + Public       Owner only
Public          Everyone                       Logged-in users
```

### Granular Controls

**Canvas Level:**
- `canView`: Public OR Protected OR Owner OR Member
- `canEdit`: Owner OR Member (depends on canvas visibility)
- `canChangeVisibility`: Owner only

**Element Level:**
- `canView`: Depends on canvas visibility
- `canEdit`: User can edit AND (element not locked OR user is creator)
- Locked elements: Only creator can edit after lock

**Comments:**
- `canView`: Depends on canvas visibility
- `canCreate`: User can edit canvas
- `canEdit`: Author only
- `canDelete`: Author only

**Canvas Memberships:**
- `canView`: Self or canvas owner
- `canCreate`: Authenticated AND (canvas public or protected)
- `canDelete`: Self or canvas owner

### Permission Checks in Code

```javascript
// Canvas access
const isOwner = userId === canvasOwnerId;
const isMember = memberships?.some(m => m.user.id === userId);
const canView = isPublic || isProtected || isOwner || isMember;
const canEdit = canView && (isOwner || isMember || isPublic);

// Element locks
const canEditElement = canEdit && (!isLocked || isCreator);

// Visibility changes
const canChangeVisibility = isOwner;
```

### Permission Rules (InstantDB CEL)

```typescript
// Canvas
canView: "isPublic || isProtected || isOwner"
canCreate: "isAuthenticated"
canUpdate: "isOwner"

// Element
canView: "canvasCanView"
canCreate: "canvasCanEdit"
canUpdate: "canvasCanEdit && (!isLocked || isCreator)"

// Comment
canView: "canvasCanView"
canCreate: "canvasCanEdit"
canDelete: "isAuthor"
```

---

## Schema Description

### Core Entities

#### **Canvases**
Primary resource representing a collaborative canvas.

```typescript
{
  id: string (auto-generated)
  name: string (canvas title)
  visibility: 'private' | 'protected' | 'public'
  ownerEmail: string (optional, first user)
  createdAt: number (ISO timestamp, indexed)

  // Links (one-to-many)
  owner: [User] (canvas owner)
  elements: [Element] (all elements on canvas)
  connections: [Connection] (connections between elements)
  memberships: [CanvasMembership] (collaborative editors)
}
```

#### **Elements**
Individual canvas objects (images, text, stickers).

```typescript
{
  id: string (auto-generated)
  type: 'image' | 'text' | 'sticker'

  // Position & Transformation
  x: number (world coordinate, left edge)
  y: number (world coordinate, top edge)
  width: number (default 220px)
  height: number (optional, auto for text)
  rotation: number (degrees, 0-360)
  zIndex: number (indexed for rendering order)

  // Content
  content: string (URL for images, text for text, emoji for stickers)

  // Styling
  style: {
    fontFamily?: string
    fontSize?: number
    color?: hex color
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
  }
  scale?: number (for text scaling)

  // Effects
  texture?: string (CSS filter: 'grain', 'noise', 'vintage')
  shape?: { clipPath?: string, borderRadius?: string }

  // Access Control
  isLocked: boolean (creator can always edit)

  // Metadata
  createdAt: number (ISO timestamp, indexed)

  // Links (many-to-one)
  canvas: Canvas
  creator: User (element creator)
  comments: [Comment] (element comments)
  fromConnections: [Connection] (lines starting here)
  toConnections: [Connection] (lines ending here)
}
```

#### **Connections**
Labeled lines connecting elements.

```typescript
{
  id: string (auto-generated)
  text?: string (optional line label)
  createdAt: number (ISO timestamp, indexed)

  // Links (many-to-one)
  canvas: Canvas
  fromElement: Element (connection start)
  toElement: Element (connection end)
  creator: User (who created)
}
```

#### **Comments**
User-generated feedback on elements.

```typescript
{
  id: string (auto-generated)
  text: string (comment content)
  createdAt: number (ISO timestamp, indexed)

  // Links (many-to-one)
  element: Element (which element)
  author: User (comment author)
}
```

#### **Canvas Memberships**
Collaborative editor access to canvases.

```typescript
{
  id: string (auto-generated)
  createdAt: number (ISO timestamp, indexed)

  // Links (many-to-one)
  canvas: Canvas (shared canvas)
  user: User (collaborative editor)
}
```

#### **Presence (Ephemeral)**
Real-time user activity, not persisted.

```typescript
{
  odId: string (user session ID)
  odUpdatedAt: number (last update timestamp)
  cursor?: { x: number, y: number } (mouse position)
  selectedElementId?: string (currently selected element)
  userName?: string (user email/name)
  avatar?: string (user avatar URL)
}
```

### Relationships

```
User (1) ────→ (many) Canvas [canvasOwner]
               ────→ (many) Element [elementCreator]
               ────→ (many) Comment [commentAuthor]
               ────→ (many) CanvasMembership [membershipUser]

Canvas (1) ────→ (many) Element [canvasElements, cascade delete]
               ────→ (many) Connection [canvasConnections, cascade delete]
               ────→ (many) CanvasMembership [membershipCanvas, cascade delete]

Element (1) ────→ (many) Connection [fromElement, cascade delete]
                ────→ (many) Connection [toElement, cascade delete]
                ────→ (many) Comment [elementComments, cascade delete]
```

### Cascade Rules

- **Delete Canvas**: Cascade deletes all elements, connections, memberships, and comments
- **Delete Element**: Cascade deletes all connections (from/to) and comments
- **Delete User**: Data remains, ownership transferred to first member or unset

---

## How to Build and Run

### Prerequisites

- **Node.js/Bun**: JavaScript runtime (project uses Bun)
- **Git**: Version control
- **InstantDB Account**: For database backend
  - Sign up at [instantdb.com](https://instantdb.com)
  - Create an app and get credentials

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd wamo-canvas
   ```

2. **Install Dependencies**
   ```bash
   bun install
   # or with npm:
   # npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Copy example
   cp .env.example .env.local

   # Edit with your InstantDB credentials
   VITE_INSTANT_APP_ID=your_app_id_here
   INSTANT_APP_ADMIN_TOKEN=your_admin_token_here
   ```

   Get credentials from InstantDB dashboard:
   - `VITE_INSTANT_APP_ID`: App ID (visible in dashboard)
   - `INSTANT_APP_ADMIN_TOKEN`: Admin token (generate from app settings)

### Development

**Start Development Server**
```bash
bun run dev
# or with npm:
# npm run dev
```

Server runs at `http://localhost:5173`

**Features:**
- Hot Module Reload (HMR) for instant updates
- Source maps for debugging
- Tailwind CSS compilation

### Production Build

**Build for Production**
```bash
bun run build
# or with npm:
# npm run build
```

Output: `dist/` directory with optimized assets

**Preview Production Build**
```bash
bun run preview
# or with npm:
# npm run preview
```

### Code Quality

**Lint Code**
```bash
bun run lint
# or with npm:
# npm run lint
```

Checks: JavaScript/JSX syntax, React hooks rules, code style

**Fix Issues**
```bash
bun run lint -- --fix
```

### Database Schema

**Sync Schema to InstantDB**

After modifying `src/instant.schema.ts`:

```javascript
// Using InstantDB Admin SDK
import { init } from "@instantdb/admin";

const db = init({
  apiURI: "https://api.instantdb.com",
  appId: "YOUR_APP_ID",
  adminToken: "YOUR_ADMIN_TOKEN",
});

// Schema is synced automatically in dev
// In production, manually update or use CI/CD
```

### Deployment

**Static Hosting (Vercel, Netlify, etc.)**

1. Build the app: `bun run build`
2. Deploy `dist/` folder
3. Configure environment variables in host dashboard
4. Set `VITE_INSTANT_APP_ID` as public variable

**Example: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel env add VITE_INSTANT_APP_ID
vercel env add INSTANT_APP_ADMIN_TOKEN
vercel
```

### Troubleshooting

**Port Already in Use**
```bash
# Change port
bun run dev --port 3000
```

**InstantDB Connection Error**
- Verify `VITE_INSTANT_APP_ID` is correct
- Check InstantDB app is active
- Ensure admin token is valid

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
bun install
bun run build
```

**Type Errors**
- Schema changes require `src/instant.schema.ts` update
- Run `bun run lint` to catch issues early

### Scripts Reference

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start dev server with HMR |
| `bun run build` | Production build |
| `bun run lint` | Check code quality |
| `bun run preview` | Preview production build |

---

## Development Workflow

### Adding a New Feature

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Update Schema** (if needed)
   Edit `src/instant.schema.ts` and push to InstantDB

3. **Implement Feature**
   - Write components in appropriate directory
   - Use InstantDB hooks for data
   - Test with dev server

4. **Code Quality**
   ```bash
   bun run lint --fix
   bun run build
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

6. **Create Pull Request**

### Modifying Permissions

1. Edit `src/instant.perms.ts`
2. Update CEL expressions for access control
3. Test with different user roles
4. Commit and deploy

---

## Additional Resources

- **InstantDB Docs**: https://docs.instantdb.com
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind Docs**: https://tailwindcss.com
- **GitHub Repository**: Link to your repo

---

*Last Updated: January 2026*
