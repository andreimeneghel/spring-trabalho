import { z } from "zod";

/**
 * Espelha as validacoes do backend (@NotBlank, @Size, @Email...).
 * Validar aqui tambem evita ida desnecessaria ao servidor — mas a validacao
 * que vale e sempre a do backend.
 */

export const loginSchema = z.object({
  email: z.string().min(1, "O email é obrigatório").email("Email em formato inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
});

export const registroSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório").max(100, "Máximo de 100 caracteres"),
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Email em formato inválido")
    .max(150, "Máximo de 150 caracteres"),
  senha: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(50, "Máximo de 50 caracteres"),
  tipo: z.enum(["OUVINTE", "ARTISTA"]),
});

export const playlistSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório").max(100, "Máximo de 100 caracteres"),
  descricao: z.string().max(300, "Máximo de 300 caracteres").optional(),
  publica: z.boolean(),
  // a validacao de formato e tamanho acontece no componente e no backend
  capa: z.string().optional(),
});

export const avaliacaoSchema = z.object({
  nota: z
    .number({ message: "Escolha uma nota" })
    .int()
    .min(1, "A nota mínima é 1")
    .max(5, "A nota máxima é 5"),
  comentario: z.string().max(500, "Máximo de 500 caracteres").optional(),
});

export const perfilSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório").max(100, "Máximo de 100 caracteres"),
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Email em formato inválido")
    .max(150, "Máximo de 150 caracteres"),
});

export const senhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "A senha atual é obrigatória"),
    novaSenha: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres")
      .max(50, "Máximo de 50 caracteres"),
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.novaSenha === d.confirmar, {
    message: "As senhas não conferem",
    path: ["confirmar"],
  })
  .refine((d) => d.novaSenha !== d.senhaAtual, {
    message: "A nova senha deve ser diferente da atual",
    path: ["novaSenha"],
  });

export const artistaSchema = z.object({
  nomeArtistico: z
    .string()
    .min(1, "O nome artístico é obrigatório")
    .max(100, "Máximo de 100 caracteres"),
  biografia: z.string().max(1000, "Máximo de 1000 caracteres").optional(),
});

export const albumSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório").max(150, "Máximo de 150 caracteres"),
  anoLancamento: z
    .number()
    .int("Informe um ano válido")
    .min(1900, "O ano deve ser a partir de 1900")
    .max(new Date().getFullYear(), "O ano não pode ser no futuro")
    .optional(),
});

export type ArtistaInput = z.infer<typeof artistaSchema>;
export type AlbumInput = z.infer<typeof albumSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
export type PlaylistInput = z.infer<typeof playlistSchema>;
export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>;
export type PerfilInput = z.infer<typeof perfilSchema>;
export type SenhaInput = z.infer<typeof senhaSchema>;
