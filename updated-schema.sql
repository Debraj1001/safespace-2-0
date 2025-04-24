-- Make sure we have the avatars storage bucket
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Make sure the users table has the correct fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS emergency_contact_email TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create users table with emergency_contact_email if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  emergency_contact_email TEXT,
  user_type TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safe_zones table if it doesn't exist
CREATE TABLE IF NOT EXISTS safe_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  content TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  content TEXT,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_logs table to track sent emails if it doesn't exist
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_safe_zones_user_id ON safe_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_type ON analysis_history(analysis_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_alert_id ON email_logs(alert_id);

-- Create RLS policies for users table if they don't exist
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own data'
  ) THEN
    CREATE POLICY "Users can view their own data" 
      ON users FOR SELECT 
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data" 
      ON users FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Create RLS policies for safe_zones table if they don't exist
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'safe_zones' AND policyname = 'Users can view their own safe zones'
  ) THEN
    CREATE POLICY "Users can view their own safe zones" 
      ON safe_zones FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'safe_zones' AND policyname = 'Users can insert their own safe zones'
  ) THEN
    CREATE POLICY "Users can insert their own safe zones" 
      ON safe_zones FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'safe_zones' AND policyname = 'Users can update their own safe zones'
  ) THEN
    CREATE POLICY "Users can update their own safe zones" 
      ON safe_zones FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'safe_zones' AND policyname = 'Users can delete their own safe zones'
  ) THEN
    CREATE POLICY "Users can delete their own safe zones" 
      ON safe_zones FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create RLS policies for alerts table if they don't exist
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Users can view their own alerts'
  ) THEN
    CREATE POLICY "Users can view their own alerts" 
      ON alerts FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Users can insert their own alerts'
  ) THEN
    CREATE POLICY "Users can insert their own alerts" 
      ON alerts FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Users can update their own alerts'
  ) THEN
    CREATE POLICY "Users can update their own alerts" 
      ON alerts FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Users can delete their own alerts'
  ) THEN
    CREATE POLICY "Users can delete their own alerts" 
      ON alerts FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create RLS policies for analysis_history table if they don't exist
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'analysis_history' AND policyname = 'Users can view their own analysis history'
  ) THEN
    CREATE POLICY "Users can view their own analysis history" 
      ON analysis_history FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'analysis_history' AND policyname = 'Users can insert their own analysis history'
  ) THEN
    CREATE POLICY "Users can insert their own analysis history" 
      ON analysis_history FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Create RLS policies for email_logs table if they don't exist
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'email_logs' AND policyname = 'Users can view their own email logs'
  ) THEN
    CREATE POLICY "Users can view their own email logs" 
      ON email_logs FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'email_logs' AND policyname = 'Users can insert their own email logs'
  ) THEN
    CREATE POLICY "Users can insert their own email logs" 
      ON email_logs FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Create function to handle new user signup if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, user_type)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_type'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;

-- Create function to update user data when auth data changes if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_trigger WHERE tgname = 'on_auth_user_updated'
  ) THEN
    CREATE TRIGGER on_auth_user_updated
      AFTER UPDATE ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();
  END IF;
END
$$;

-- Create function to log email sending if it doesn't exist
CREATE OR REPLACE FUNCTION public.log_email_sent() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_logs (
    user_id, 
    alert_id, 
    recipient_email, 
    subject, 
    status
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    (SELECT emergency_contact_email FROM users WHERE id = NEW.user_id),
    'SafeSpace Alert: ' || NEW.alert_type,
    'sent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log emails when alerts are created if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_trigger WHERE tgname = 'on_alert_created'
  ) THEN
    CREATE TRIGGER on_alert_created
      AFTER INSERT ON alerts
      FOR EACH ROW EXECUTE PROCEDURE public.log_email_sent();
  END IF;
END
$$;
