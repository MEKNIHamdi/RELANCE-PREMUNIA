-- Create profiles table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'commercial',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nouveau'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'commercial')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for other tables to use profiles
DROP POLICY IF EXISTS "Users can view assigned prospects" ON prospects;
CREATE POLICY "Users can view assigned prospects" ON prospects 
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
    );

DROP POLICY IF EXISTS "Users can insert prospects" ON prospects;
CREATE POLICY "Users can insert prospects" ON prospects 
    FOR INSERT WITH CHECK (
        assigned_to = auth.uid() OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
    );

DROP POLICY IF EXISTS "Users can update assigned prospects" ON prospects;
CREATE POLICY "Users can update assigned prospects" ON prospects 
    FOR UPDATE USING (
        assigned_to = auth.uid() OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
    );

-- Update foreign key references
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_assigned_to_fkey;
ALTER TABLE prospects ADD CONSTRAINT prospects_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES profiles(id);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES profiles(id);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES profiles(id);

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_assigned_to_fkey;
ALTER TABLE appointments ADD CONSTRAINT appointments_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES profiles(id);

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_created_by_fkey;
ALTER TABLE appointments ADD CONSTRAINT appointments_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES profiles(id);

-- Insert demo users into auth.users (this would normally be done via Supabase Auth)
-- Note: In production, users would sign up through the Supabase Auth interface
