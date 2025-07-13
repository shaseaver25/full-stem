-- Remove the orphaned teacher profile that has no corresponding auth user
DELETE FROM teacher_profiles 
WHERE user_id = 'f7bf1000-c393-41fe-bdce-4d80dbcf954f';