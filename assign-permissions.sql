-- Assign all permissions to role ID: 47567090-cc7e-4dc5-bb2a-9552ca92669f
INSERT INTO role_permissions (role_id, permission_id)
SELECT '47567090-cc7e-4dc5-bb2a-9552ca92669f', id
FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verify the assignments
SELECT COUNT(*) as total_permissions_assigned 
FROM role_permissions 
WHERE role_id = '47567090-cc7e-4dc5-bb2a-9552ca92669f';