-- Foto de perfil do usuario (pedido do Andrei, dono do modulo de Usuario).
--
-- A imagem e guardada como data URI em base64 (ex.: "data:image/png;base64,...").
-- E o caminho mais simples para um projeto academico: nao precisa de storage
-- externo nem servir arquivo estatico. TEXT porque o base64 passa facil de 64KB.
ALTER TABLE usuario ADD COLUMN foto TEXT;
