-- Estrutura minima de Artista, Album, Musica e Categoria.
-- Feita aqui porque Playlist e Avaliacao (V3) dependem de musica.
-- Gustavo (Artista/Album) e Douglas (Musica/Categoria) podem evoluir estas tabelas
-- em migrations novas (V4, V5...), sem alterar este arquivo.

CREATE TABLE artista (
    id             BIGSERIAL    PRIMARY KEY,
    nome_artistico VARCHAR(100) NOT NULL,
    biografia      VARCHAR(1000),
    usuario_id     BIGINT       NOT NULL,
    CONSTRAINT uk_artista_usuario UNIQUE (usuario_id),
    CONSTRAINT fk_artista_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
);

CREATE TABLE album (
    id              BIGSERIAL    PRIMARY KEY,
    titulo          VARCHAR(150) NOT NULL,
    ano_lancamento  INTEGER,
    artista_id      BIGINT       NOT NULL,
    CONSTRAINT fk_album_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE
);

CREATE TABLE categoria (
    id   BIGSERIAL   PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    CONSTRAINT uk_categoria_nome UNIQUE (nome)
);

CREATE TABLE musica (
    id         BIGSERIAL    PRIMARY KEY,
    titulo     VARCHAR(150) NOT NULL,
    duracao    INTEGER      NOT NULL,   -- em segundos
    artista_id BIGINT       NOT NULL,
    album_id   BIGINT,
    CONSTRAINT fk_musica_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT fk_musica_album   FOREIGN KEY (album_id)   REFERENCES album (id)   ON DELETE SET NULL,
    CONSTRAINT ck_musica_duracao CHECK (duracao > 0)
);

CREATE TABLE musica_categoria (
    musica_id    BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,
    CONSTRAINT pk_musica_categoria PRIMARY KEY (musica_id, categoria_id),
    CONSTRAINT fk_mc_musica    FOREIGN KEY (musica_id)    REFERENCES musica (id)    ON DELETE CASCADE,
    CONSTRAINT fk_mc_categoria FOREIGN KEY (categoria_id) REFERENCES categoria (id) ON DELETE CASCADE
);

CREATE INDEX ix_album_artista  ON album  (artista_id);
CREATE INDEX ix_musica_artista ON musica (artista_id);
CREATE INDEX ix_musica_album   ON musica (album_id);
