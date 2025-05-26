# IGN Entertainment Website

A modern entertainment news website built with Next.js 15, Supabase, and Tailwind CSS. Features real-time content management, user authentication, and a comprehensive admin panel.

## Features

### 🎮 Content Management
- **Multi-category support**: Gaming, Movies, TV Shows, Tech, Esports
- **Rich article editor** with image uploads and formatting
- **Real-time content updates** across all pages
- **SEO-optimized** article pages with metadata

### 👥 User System
- **Secure authentication** with Supabase Auth
- **Role-based access control** (User, Writer, Editor, Admin)
- **User profiles** with customizable avatars and bios
- **Comment system** with real-time updates

### 🛡️ Admin Panel
- **Complete dashboard** with analytics and metrics
- **Article management** - create, edit, publish, delete
- **User management** with role assignments
- **Category management** with custom branding
- **Site settings** and configuration
- **Security controls** with super admin protection

### 🔍 Advanced Features
- **Full-text search** across all content
- **Responsive design** for all devices
- **Newsletter signup** with email collection
- **Trending content** sidebar
- **Real-time notifications**

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Icons**: Lucide React

## Quick Start

### 1. Environment Setup

Add these environment variables to your project:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 2. Database Setup

Run the SQL schema in your Supabase SQL editor:

\`\`\`sql
-- Execute the contents of supabase/schema.sql
-- This creates all tables, policies, and security functions
\`\`\`

### 3. Super Admin Setup

Update your email in these files to become the super admin:
- \`lib/admin-security.ts\` (line 4)
- \`supabase/admin-security.sql\` (lines 4 and 25)

Then run the admin security SQL:

\`\`\`sql
-- Execute the contents of supabase/admin-security.sql
\`\`\`

### 4. Initialize Database

Visit \`/admin/init\` to set up sample data and categories.

### 5. Start Development

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your website.

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── articles/          # Article detail pages
│   ├── auth/              # Authentication pages
│   ├── gaming/            # Category pages
│   └── ...
├── components/            # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── article/          # Article display components
│   ├── home/             # Homepage components
│   ├── navigation/       # Header and navigation
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions and configs
├── scripts/              # Database initialization scripts
└── supabase/            # Database schema and migrations
\`\`\`

## Key Pages

### Public Pages
- \`/\` - Homepage with featured content
- \`/gaming\`, \`/movies\`, \`/tv-shows\`, \`/tech\`, \`/esports\` - Category pages
- \`/articles/[slug]\` - Individual article pages
- \`/search\` - Search functionality
- \`/auth/signin\`, \`/auth/signup\` - Authentication

### Admin Pages (Admin Only)
- \`/admin\` - Main dashboard
- \`/admin/articles\` - Article management
- \`/admin/users\` - User management
- \`/admin/categories\` - Category management
- \`/admin/analytics\` - Site analytics
- \`/admin/settings\` - Site configuration
- \`/admin/security\` - Security monitoring

## Database Schema

### Core Tables
- \`profiles\` - User profiles and roles
- \`categories\` - Content categories
- \`articles\` - Main content
- \`comments\` - User comments
- \`newsletter_subscribers\` - Email subscriptions

### Security Features
- **Row Level Security (RLS)** on all tables
- **Role-based access control** with automatic enforcement
- **Super admin protection** prevents unauthorized admin access
- **Database triggers** for security validation

## User Roles

1. **User** - Can read articles, comment, manage own profile
2. **Writer** - Can create and edit own articles
3. **Editor** - Can edit any article, moderate comments
4. **Admin** - Full access to admin panel and all features

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

\`\`\`bash
npm run build
npm start
\`\`\`

## Security

- **Environment variables** for sensitive data
- **Supabase RLS policies** for data protection
- **Role-based access control** throughout the application
- **Super admin protection** with email verification
- **Input validation** and sanitization
- **CSRF protection** with Supabase Auth

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the admin security dashboard at \`/admin/security\`
2. Review Supabase logs for database issues
3. Check browser console for client-side errors
4. Verify environment variables are set correctly

## License

This project is open source and available under the MIT License.
