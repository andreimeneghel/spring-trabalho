CREATE TABLE usuario (
    id    BIGSERIAL    PRIMARY KEY,
    nome  VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo  VARCHAR(20)  NOT NULL,
    CONSTRAINT uk_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_tipo CHECK (tipo IN ('OUVINTE', 'ARTISTA'))
);
