-- Enable realtime for profiles table
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- Add profiles to realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;