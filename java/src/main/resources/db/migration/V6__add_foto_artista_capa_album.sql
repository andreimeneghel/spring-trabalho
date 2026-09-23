-- Foto do artista e capa do album, no mesmo formato ja usado na foto de perfil
-- do usuario e na capa da playlist: data URI em base64 ("data:image/png;base64,...").
-- TEXT porque o base64 passa facil de 64KB.
ALTER TABLE artista ADD COLUMN foto TEXT;
ALTER TABLE album ADD COLUMN capa TEXT;
