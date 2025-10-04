-- Migration pour mettre à jour la base de données selon le nouveau formulaire d'inscription
-- Date: 2025-10-04
-- Description: Ajout des champs parent (prénom, nom, email, mot de passe) et suppression de medical_record

-- 1. Ajouter les colonnes pour les informations des parents dans la table enrollments
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS parent_first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS parent_last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20);

-- 2. Supprimer la colonne medical_record qui n'est plus utilisée
ALTER TABLE enrollments 
DROP COLUMN IF EXISTS medical_record;

-- 3. Modifier la colonne lunch_assistance pour avoir une valeur par défaut
ALTER TABLE enrollments 
ALTER COLUMN lunch_assistance SET DEFAULT FALSE;

-- 4. Ajouter un index sur parent_email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_enrollments_parent_email ON enrollments(parent_email);

-- 5. Mettre à jour les enrollments existants avec des valeurs par défaut si nécessaire
UPDATE enrollments 
SET lunch_assistance = FALSE 
WHERE lunch_assistance IS NULL;

-- 6. Ajouter une contrainte pour s'assurer que parent_email est unique par enrollment
-- (Un parent peut avoir plusieurs enfants, mais chaque inscription doit avoir un email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_unique_email_child 
ON enrollments(parent_email, child_id);

-- 7. Commentaires sur les colonnes
COMMENT ON COLUMN enrollments.parent_first_name IS 'Prénom du parent responsable';
COMMENT ON COLUMN enrollments.parent_last_name IS 'Nom de famille du parent responsable';
COMMENT ON COLUMN enrollments.parent_email IS 'Email du parent pour la connexion';
COMMENT ON COLUMN enrollments.parent_password IS 'Mot de passe hashé du parent';
COMMENT ON COLUMN enrollments.parent_phone IS 'Numéro de téléphone du parent';
COMMENT ON COLUMN enrollments.lunch_assistance IS 'Assistance au déjeuner (20 TND/mois)';
