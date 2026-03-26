# Natural Resource Consulting

A conversion-focused marketing website for a Natural Resource consulting business, featuring an AI-powered chat interface that engages visitors and guides them toward becoming clients.

## Project Overview

This site serves as the digital presence for a professional coaching and consulting practice. Built with a premium design aesthetic, it showcases expertise through case studies, testimonials, and career history while leveraging AI to create personalized engagement experiences.

The centerpiece is an intelligent chat interface that:
- Engages visitors with contextual conversations about their challenges
- Surfaces relevant business artifacts (case studies, scope templates, methodologies)
- Tracks engagement and prompts account creation at optimal conversion moments
- Persists conversations as project briefs for follow-up

## Features

### AI-Powered Chat Interface
- Launches automatically on page load with welcoming message
- Grounded in comprehensive business context and consultant expertise
- Surfaces relevant artifacts contextually during conversations
- Tracks engagement scoring to identify high-intent visitors

### Conversion Optimization
- Engagement threshold triggers account creation prompts
- Magic link authentication for frictionless signup
- Conversation persistence as structured project briefs
- Seamless transition from anonymous visitor to authenticated lead

### Content Management
- Lightweight CMS integration for managing artifacts
- Dynamic content surfacing based on conversation context
- Easy updates to case studies, templates, and resources

### Premium User Experience
- Modern, sophisticated design with attention to detail
- Smooth animations and micro-interactions
- Fully responsive across all device sizes
- Fast page loads and optimal performance

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **AI Integration**: Claude API (Anthropic SDK)
- **Database & Auth**: Supabase
- **CMS**: Sanity or Notion (planned)
- **Deployment**: Vercel
- **Version Control**: GitHub

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Supabase account and project
- Anthropic API key (for Claude AI)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd natural-resource
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Fill in your credentials (see Environment Variables section below)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser

5. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic API (Claude AI)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: CMS Configuration
VITE_SANITY_PROJECT_ID=your_sanity_project_id
VITE_SANITY_DATASET=production
```

### Getting Your Credentials

- **Supabase**: Sign up at [supabase.com](https://supabase.com), create a project, and find your URL and anon key in Project Settings > API
- **Anthropic**: Get your API key from [console.anthropic.com](https://console.anthropic.com)
- **Sanity** (if using): Create a project at [sanity.io](https://www.sanity.io)

## Project Structure

```
natural-resource/
├── public/
│   ├── favicon.png/        # Site favicon
│   ├── logos/              # Brand and client logos
│   └── ProblemBackground.webp
├── src/
│   ├── components/
│   │   ├── CareerTimeline.tsx
│   │   ├── Chat.tsx        # AI chat interface
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Nav.tsx
│   │   ├── Problem.tsx
│   │   ├── Session.tsx
│   │   ├── TestimonialCarousel.tsx
│   │   ├── WhyMe.tsx
│   │   └── Work.tsx
│   ├── hooks/
│   │   └── useReveal.ts    # Scroll reveal animations
│   ├── lib/
│   │   ├── ai.ts           # AI integration logic
│   │   └── store.ts        # Zustand state management
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── package.json
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## Key Components

### Chat Component
The AI-powered chat interface that handles:
- Message streaming from Claude API
- Conversation state management
- Engagement scoring
- Artifact surfacing

### State Management (store.ts)
Centralized state using Zustand for:
- Chat messages and conversation history
- User authentication state
- Engagement metrics
- UI state (modals, loading states)

### AI Integration (ai.ts)
Handles communication with Claude API:
- System prompt with business context
- Message formatting and streaming
- Context injection for artifact surfacing

## Development Workflow

### Component Development
- Each component follows single responsibility principle
- Reusable design system components
- Consistent styling using Tailwind utilities
- TypeScript for type safety

### State Management
- Centralized Zustand store for global state
- No prop drilling through component tree
- Predictable state updates

### Styling Approach
- Tailwind CSS for utility-first styling
- Custom design system with consistent spacing, colors, typography
- Responsive breakpoints for all screen sizes
- Premium feel with subtle animations

## Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

2. **Configure environment variables**
   - Add all variables from `.env` to Vercel project settings
   - Go to Project Settings > Environment Variables

3. **Deploy**
   - Push to main branch to trigger automatic deployments
   - Preview deployments created for pull requests

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

## Performance Optimization

- Vite for fast builds and hot module replacement
- Code splitting for optimal bundle sizes
- Lazy loading for images and components
- Optimized animations using CSS transforms
- Tailwind CSS purging for minimal CSS bundle

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a private business website. For questions or issues, contact the project maintainer.

## License

Proprietary - All rights reserved

## Contact

For consulting inquiries or questions about this project, visit the website or reach out through the AI chat interface.

---

Built with ❤️ using React, Vite, and Claude AI
