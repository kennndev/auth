-- Create table for storing uploaded custom card images
CREATE TABLE IF NOT EXISTS public.uploaded_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_type TEXT,
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    session_id TEXT, -- Temporary session ID until we have user auth
    user_email TEXT, -- Optional email if provided
    user_id UUID, -- For future user authentication system
    metadata JSONB DEFAULT '{}'::jsonb, -- Flexible field for additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_uploaded_images_session_id ON public.uploaded_images(session_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id ON public.uploaded_images(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at ON public.uploaded_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_email ON public.uploaded_images(user_email);

-- Add RLS (Row Level Security) - disabled for now but ready for when auth is added
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (will be restricted when auth is added)
CREATE POLICY "Allow all operations on uploaded_images" ON public.uploaded_images
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.uploaded_images IS 'Stores references to custom card images uploaded by users';
COMMENT ON COLUMN public.uploaded_images.image_url IS 'Public URL of the uploaded image in Supabase Storage';
COMMENT ON COLUMN public.uploaded_images.storage_path IS 'Path to the file in Supabase Storage bucket';
COMMENT ON COLUMN public.uploaded_images.session_id IS 'Temporary session identifier until user auth is implemented';
COMMENT ON COLUMN public.uploaded_images.user_id IS 'Future reference to authenticated user';
COMMENT ON COLUMN public.uploaded_images.metadata IS 'Flexible JSON field for storing additional information';