-- Enhanced photos table with explainable AI features
create table if not exists photos (
id uuid primary key default uuid_generate_v4(),
user_id uuid references auth.users(id),
original_url text,
processed_url text,
summary text,
perceptual_metrics jsonb, -- Store original and processed metrics
accessibility_filter text,
auto_enhanced boolean default false,
file_id text,
created_at timestamp default now()
);

-- Enhanced presets table with user preference adaptation
create table if not exists presets (
id uuid primary key default uuid_generate_v4(),
user_id uuid references auth.users(id),
name text not null,
settings jsonb not null,
accessibility_filter text,
auto_enhance boolean default false,
usage_count integer default 0, -- Track usage for preference learning
category text default 'custom', -- e.g., 'portrait', 'landscape', 'accessibility'
description text,
is_public boolean default false, -- Allow sharing presets
created_at timestamp default now(),
updated_at timestamp default now()
);

-- User preferences table for adaptive learning
create table if not exists user_preferences (
id uuid primary key default uuid_generate_v4(),
user_id uuid references auth.users(id),
preferred_brightness_range jsonb, -- Store min/max brightness preferences
preferred_contrast_range jsonb,
preferred_saturation_range jsonb,
favorite_categories text[], -- Array of favorite preset categories
accessibility_needs text[], -- Store user's accessibility requirements
created_at timestamp default now(),
updated_at timestamp default now()
);

-- Preset ratings for collaborative filtering
create table if not exists preset_ratings (
id uuid primary key default uuid_generate_v4(),
user_id uuid references auth.users(id),
preset_id uuid references presets(id),
rating integer check (rating >= 1 and rating <= 5),
feedback text,
created_at timestamp default now()
);

-- Create indexes for better performance
create index if not exists idx_presets_user_id on presets(user_id);
create index if not exists idx_presets_category on presets(category);
create index if not exists idx_presets_public on presets(is_public);
create index if not exists idx_photos_user_id on photos(user_id);
create index if not exists idx_user_preferences_user_id on user_preferences(user_id);
create index if not exists idx_preset_ratings_preset_id on preset_ratings(preset_id);