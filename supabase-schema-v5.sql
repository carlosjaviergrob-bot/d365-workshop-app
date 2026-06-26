-- D365FO Workshop Tool — Schema v5
-- Agregar campos enriquecidos a scenario_selection

ALTER TABLE scenario_selection 
ADD COLUMN IF NOT EXISTS forms text,
ADD COLUMN IF NOT EXISTS biz_question text,
ADD COLUMN IF NOT EXISTS key_points text,
ADD COLUMN IF NOT EXISTS tip text;
