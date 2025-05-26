-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'writer', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#00d4ff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  seo_meta JSONB
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  overall_score DECIMAL(3,1) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 10),
  score_breakdown JSONB NOT NULL,
  pros_list TEXT[] DEFAULT '{}',
  cons_list TEXT[] DEFAULT '{}',
  recommendation_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories (before enabling RLS)
INSERT INTO public.categories (name, slug, description, color) VALUES
('Gaming', 'gaming', 'Latest gaming news and reviews', '#00d4ff'),
('Movies', 'movies', 'Movie reviews and entertainment news', '#b347d9'),
('TV Shows', 'tv-shows', 'Television series reviews and updates', '#39ff14'),
('Tech', 'tech', 'Technology reviews and news', '#ff6b35'),
('Esports', 'esports', 'Competitive gaming and esports coverage', '#ff0080')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Function to safely create or replace policies
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
  policy_name TEXT,
  table_name TEXT,
  policy_type TEXT,
  policy_definition TEXT
) RETURNS VOID AS $$
BEGIN
  -- Drop the policy if it exists
  EXECUTE format('DROP POLICY IF EXISTS %I ON %s', policy_name, table_name);
  
  -- Create the new policy
  EXECUTE format('CREATE POLICY %I ON %s %s %s', 
    policy_name, table_name, policy_type, policy_definition);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for Users
SELECT create_policy_if_not_exists(
  'Users can view their own data',
  'public.users',
  'FOR SELECT',
  'USING (auth.uid() = id)'
);

SELECT create_policy_if_not_exists(
  'Users can insert their own data',
  'public.users',
  'FOR INSERT',
  'WITH CHECK (auth.uid() = id)'
);

SELECT create_policy_if_not_exists(
  'Users can update their own data',
  'public.users',
  'FOR UPDATE',
  'USING (auth.uid() = id)'
);

-- RLS Policies for Categories
SELECT create_policy_if_not_exists(
  'Categories are viewable by everyone',
  'public.categories',
  'FOR SELECT',
  'USING (true)'
);

SELECT create_policy_if_not_exists(
  'Authenticated users can insert categories',
  'public.categories',
  'FOR INSERT',
  'WITH CHECK (auth.uid() IS NOT NULL)'
);

SELECT create_policy_if_not_exists(
  'Authenticated users can update categories',
  'public.categories',
  'FOR UPDATE',
  'USING (auth.uid() IS NOT NULL)'
);

SELECT create_policy_if_not_exists(
  'Authenticated users can delete categories',
  'public.categories',
  'FOR DELETE',
  'USING (auth.uid() IS NOT NULL)'
);

-- RLS Policies for Articles
SELECT create_policy_if_not_exists(
  'Published articles are viewable by everyone',
  'public.articles',
  'FOR SELECT',
  'USING (status = ''published'' OR auth.uid() = author_id)'
);

SELECT create_policy_if_not_exists(
  'Users can insert their own articles',
  'public.articles',
  'FOR INSERT',
  'WITH CHECK (auth.uid() = author_id)'
);

SELECT create_policy_if_not_exists(
  'Users can update their own articles',
  'public.articles',
  'FOR UPDATE',
  'USING (auth.uid() = author_id)'
);

SELECT create_policy_if_not_exists(
  'Users can delete their own articles',
  'public.articles',
  'FOR DELETE',
  'USING (auth.uid() = author_id)'
);

-- RLS Policies for Reviews
SELECT create_policy_if_not_exists(
  'Reviews are viewable by everyone',
  'public.reviews',
  'FOR SELECT',
  'USING (true)'
);

SELECT create_policy_if_not_exists(
  'Authenticated users can insert reviews',
  'public.reviews',
  'FOR INSERT',
  'WITH CHECK (auth.uid() IS NOT NULL)'
);

SELECT create_policy_if_not_exists(
  'Users can update their own reviews',
  'public.reviews',
  'FOR UPDATE',
  'USING (EXISTS (SELECT 1 FROM public.articles WHERE articles.id = reviews.article_id AND articles.author_id = auth.uid()))'
);

-- RLS Policies for Comments
SELECT create_policy_if_not_exists(
  'Approved comments are viewable by everyone',
  'public.comments',
  'FOR SELECT',
  'USING (status = ''approved'' OR user_id = auth.uid())'
);

SELECT create_policy_if_not_exists(
  'Users can insert their own comments',
  'public.comments',
  'FOR INSERT',
  'WITH CHECK (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
  'Users can update their own comments',
  'public.comments',
  'FOR UPDATE',
  'USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
  'Users can delete their own comments',
  'public.comments',
  'FOR DELETE',
  'USING (auth.uid() = user_id)'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON public.articles(publish_date);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clean up the helper function (optional)
DROP FUNCTION IF EXISTS create_policy_if_not_exists(TEXT, TEXT, TEXT, TEXT);
