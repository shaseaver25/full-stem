-- Clean up and assign correct roles for test accounts

-- Developer access for shannon@creatempls.org
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'shannon@creatempls.org');

INSERT INTO user_roles (user_id, role)
SELECT id, 'developer' FROM auth.users WHERE email = 'shannon@creatempls.org'
ON CONFLICT DO NOTHING;

-- Teacher-only access for teacher@test.com
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'teacher@test.com');

INSERT INTO user_roles (user_id, role)
SELECT id, 'teacher' FROM auth.users WHERE email = 'teacher@test.com'
ON CONFLICT DO NOTHING;