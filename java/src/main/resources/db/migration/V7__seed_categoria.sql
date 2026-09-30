-- Categorias iniciais (parte do Douglas: Musica e Categoria).
--
-- Categoria e uma tabela de apoio compartilhada por todos os artistas: sem uma
-- lista inicial, o primeiro artista a cadastrar musica nao teria nada para
-- escolher. O CRUD em /categorias continua permitindo criar, renomear e excluir.
--
-- Nao usa ON CONFLICT nem MERGE para funcionar igual no PostgreSQL e no H2 dos
-- testes: a V2 cria a tabela vazia, entao aqui nao ha o que conflitar.
INSERT INTO categoria (nome) VALUES
    ('Rock'),
    ('Pop'),
    ('MPB'),
    ('Samba'),
    ('Sertanejo'),
    ('Forro'),
    ('Hip Hop'),
    ('Eletronica'),
    ('Jazz'),
    ('Classica'),
    ('Reggae'),
    ('Metal');
