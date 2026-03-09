# PromptIT Community Module

This folder contains all components for the Community page, designed with a modular architecture following GitHub's homepage aesthetic.

## Navigation

The Community page integrates seamlessly with the main PromptIT app:

- **Home → Community**: Click the Users icon in the top-right corner of the home page
- **Community → Home**: Click the Home icon in the top-left corner of the community header

The navigation is handled through prop callbacks:
```tsx
// In App.tsx
<CommunityPage onNavigateHome={() => setCurrentPage('home')} />

// In CommunityPage.tsx
<CommunityHeader onNavigateHome={onNavigateHome} />
```

## Structure

```
community/
├── CommunityPage.tsx       # Main page component (orchestrates all components)
├── CommunityHeader.tsx     # Top navigation header
├── CommunityTabs.tsx       # Community/My Templates tabs
├── CommunitySearch.tsx     # Search input component
├── CommunityFilters.tsx    # Sort and category filters
├── PostsFeed.tsx           # Container for post list
├── PostCard.tsx            # Individual post card
├── MySidebar.tsx           # Right sidebar with templates
├── NewPostModal.tsx        # Modal for creating new posts
├── PostDetailModal.tsx     # Modal for viewing post details
├── LoadingState.tsx        # Loading skeleton component
├── EmptyState.tsx          # Empty state component
├── types.ts                # TypeScript interfaces
├── mockData.ts             # Mock data for posts and templates
└── index.ts                # Barrel export file
```

## Design System

Following GitHub's dark theme aesthetic:

- **Background**: `#0d1117` (main), `#161b22` (cards)
- **Borders**: `#30363d`
- **Text**: `white` (primary), `#8b949e` (secondary)
- **Accent**: `#58a6ff` (blue), `#238636` (green), `#f78166` (orange)

## Features

- ✅ Post creation and viewing
- ✅ Upvote/downvote system
- ✅ Comments section
- ✅ Bookmark functionality
- ✅ Search and filtering
- ✅ Sort by Hot/New/Top
- ✅ Category filtering
- ✅ Template sidebar
- ✅ Responsive design
- ✅ Dark theme

## Usage

```tsx
import { CommunityPage } from './components/community';

// In your app
<CommunityPage />
```

## Customization

- Modify `mockData.ts` to add/edit posts and templates
- Update color scheme in individual components
- Add new features by extending the types in `types.ts`