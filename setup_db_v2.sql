-- Add new columns for Watched and Following features
alter table profiles 
add column if not exists watched bigint[] default '{}',
add column if not exists following uuid[] default '{}';

-- Update RLS policies to allow users to update their own watched/following lists
-- (Existing update policy should cover this, but good to verify)
-- The existing policy "Users can update own profile" usually allows updating all columns.
