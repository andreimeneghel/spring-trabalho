-- Parte do Luiz Fellipe Rocha: Playlist e Avaliacao.

CREATE TABLE playlist (
    id          BIGSERIAL    PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    descricao   VARCHAR(300),
    publica     BOOLEAN      NOT NULL DEFAULT TRUE,
    criada_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id  BIGINT       NOT NULL,
    CONSTRAINT fk_playlist_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    -- o mesmo usuario nao pode ter duas playlists com o mesmo nome
    CONSTRAINT uk_playlist_usuario_nome UNIQUE (usuario_id, nome)
);

-- N:N entre playlist e musica. A coluna ordem guarda a posicao da musica na playlist.
CREATE TABLE playlist_musica (
    playlist_id     BIGINT    NOT NULL,
    musica_id       BIGINT    NOT NULL,
    ordem           INTEGER   NOT NULL,
    adicionada_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_playlist_musica PRIMARY KEY (playlist_id, musica_id),
    CONSTRAINT fk_pm_playlist FOREIGN KEY (playlist_id) REFERENCES playlist (id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_musica   FOREIGN KEY (musica_id)   REFERENCES musica (id)   ON DELETE CASCADE,
    CONSTRAINT ck_pm_ordem CHECK (ordem >= 0)
);

CREATE TABLE avaliacao (
    id          BIGSERIAL    PRIMARY KEY,
    nota        SMALLINT     NOT NULL,
    comentario  VARCHAR(500),
    criada_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP,
    usuario_id  BIGINT       NOT NULL,
    musica_id   BIGINT       NOT NULL,
    CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_musica  FOREIGN KEY (musica_id)  REFERENCES musica (id)  ON DELETE CASCADE,
    CONSTRAINT ck_avaliacao_nota CHECK (nota BETWEEN 1 AND 5),
    -- cada usuario avalia uma musica uma unica vez
    CONSTRAINT uk_avaliacao_usuario_musica UNIQUE (usuario_id, musica_id)
);

CREATE INDEX ix_playlist_usuario  ON playlist  (usuario_id);
CREATE INDEX ix_avaliacao_musica  ON avaliacao (musica_id);
CREATE INDEX ix_avaliacao_usuario ON avaliacao (usuario_id);
