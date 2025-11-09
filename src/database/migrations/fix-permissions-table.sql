-- Migration to fix permissions table structure
-- Run this if your permissions table doesn't have the correct columns

-- Check if columns exist and add them if missing
DO $$
BEGIN
    -- Add permission_name_en column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permissions' AND column_name = 'permission_name_en') THEN
        -- If permission_name exists, rename it to permission_name_en
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permissions' AND column_name = 'permission_name') THEN
            ALTER TABLE permissions RENAME COLUMN permission_name TO permission_name_en;
        ELSE
            ALTER TABLE permissions ADD COLUMN permission_name_en VARCHAR(255) NOT NULL;
        END IF;
    END IF;

    -- Add permission_name_ar column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permissions' AND column_name = 'permission_name_ar') THEN
        ALTER TABLE permissions ADD COLUMN permission_name_ar VARCHAR(255);
    END IF;

    -- Add description_en column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permissions' AND column_name = 'description_en') THEN
        -- If description exists, rename it to description_en
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permissions' AND column_name = 'description') THEN
            ALTER TABLE permissions RENAME COLUMN description TO description_en;
        ELSE
            ALTER TABLE permissions ADD COLUMN description_en TEXT;
        END IF;
    END IF;

    -- Add description_ar column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permissions' AND column_name = 'description_ar') THEN
        ALTER TABLE permissions ADD COLUMN description_ar TEXT;
    END IF;
END $$;