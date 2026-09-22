-- Capa da playlist, no mesmo formato da foto de perfil do usuario:
-- data URI em base64 (ex.: "data:image/png;base64,..."). TEXT porque o base64
-- passa facil de 64KB. Quando null, a UI mostra um icone generico.
ALTER TABLE playlist ADD COLUMN capa TEXT;
