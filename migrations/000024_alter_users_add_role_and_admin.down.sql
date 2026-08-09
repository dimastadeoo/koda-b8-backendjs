-- 1. Hapus profile admin
DELETE FROM "profiles" 
WHERE "id_user" IN (SELECT "id" FROM "users" WHERE "email" = 'admin@belimudah.com');

-- 2. Hapus user admin
DELETE FROM "users" WHERE "email" = 'admin@belimudah.com';

-- 3. [PERBAIKAN] Hapus dulu kolom id_role dan created_by 
--    (ini akan otomatis menghapus foreign key constraint-nya)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='id_role') THEN
        ALTER TABLE "users" DROP COLUMN "id_role";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='created_by') THEN
        ALTER TABLE "users" DROP COLUMN "created_by";
    END IF;
END $$;

-- 4. Sekarang baru aman untuk hapus roles (karena kolom id_role sudah tidak ada)
DELETE FROM "roles" WHERE name IN ('admin', 'customer', 'staff');