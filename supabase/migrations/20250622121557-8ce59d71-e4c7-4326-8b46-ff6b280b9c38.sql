
-- Enable Row Level Security on User Preferences table
ALTER TABLE "User Preferences" ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own preferences
CREATE POLICY "Users can view their own preferences" ON "User Preferences"
    FOR SELECT USING (auth.jwt() ->> 'email' = "User Email");

-- Allow users to insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON "User Preferences"
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = "User Email");

-- Allow users to update their own preferences
CREATE POLICY "Users can update their own preferences" ON "User Preferences"
    FOR UPDATE USING (auth.jwt() ->> 'email' = "User Email");

-- Allow users to delete their own preferences
CREATE POLICY "Users can delete their own preferences" ON "User Preferences"
    FOR DELETE USING (auth.jwt() ->> 'email' = "User Email");
