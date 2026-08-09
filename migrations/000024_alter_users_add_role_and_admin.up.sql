
-- 1. Tambahkan kolom ke users (jika belum ada)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='id_role') THEN
        ALTER TABLE "users" ADD COLUMN "id_role" BIGINT REFERENCES "roles"("id");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='created_by') THEN
        ALTER TABLE "users" ADD COLUMN "created_by" BIGINT REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Insert roles default
INSERT INTO "roles" (name) VALUES ('admin'), ('customer'), ('staff') 
ON CONFLICT (name) DO NOTHING;

-- 3. Insert admin user
INSERT INTO "users" (
    "email", "password", "hp_number", "id_role", "created_by"
) VALUES (
    'admin@belimudah.com', 
    '$2b$10$0MBh.sz7Ce0sI9AID4gchussEpNgnlys9c/.nkVN8Qw2VavLmQTim',
    '081234567890', 
    (SELECT "id" FROM "roles" WHERE "name" = 'admin'), 
    NULL
) ON CONFLICT ("email") DO NOTHING;

-- 4. Update semua user existing menjadi role customer (jika masih NULL)
UPDATE "users" 
SET "id_role" = (SELECT "id" FROM "roles" WHERE "name" = 'customer') 
WHERE "id_role" IS NULL;

-- 5. Buat profile untuk admin (name di profile, karena name di users sudah dihapus)
INSERT INTO "profiles" ("id_user", "name", "gender", "picture") 
SELECT "u"."id", 'Super Admin', 'male', NULL 
FROM "users" "u" 
WHERE "u"."email" = 'admin@belimudah.com' 
  AND NOT EXISTS (SELECT 1 FROM "profiles" "p" WHERE "p"."id_user" = "u"."id")
ON CONFLICT ("id_user") DO NOTHING;
