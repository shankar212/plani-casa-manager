import { z } from 'zod';

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
  fullName: z.string().trim().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
});

export const signInSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(1, 'Senha é obrigatória').max(100, 'Senha muito longa'),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
});

// Project schemas
export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Nome do projeto é obrigatório').max(200, 'Nome muito longo'),
  constructionType: z.string().min(1, 'Tipo de construção é obrigatório'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["Pré-projeto", "Projeto", "Obras", "Pós obra", "Financiamento"], { required_error: 'Status é obrigatório' }),
  client: z.string().trim().min(1, 'Cliente é obrigatório').max(200, 'Nome do cliente muito longo'),
  engineer: z.string().trim().min(1, 'Engenheiro/Arquiteto é obrigatório').max(200, 'Nome muito longo'),
  team: z.string().trim().max(2000, 'Descrição da equipe muito longa').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'Data de término deve ser posterior à data de início',
  path: ['endDate'],
});

// Material schemas
export const materialSchema = z.object({
  material_name: z.string().trim().min(1, 'Nome do material é obrigatório').max(200, 'Nome muito longo'),
  quantity: z.number().positive('Quantidade deve ser maior que zero').max(1000000, 'Quantidade muito grande'),
  unit: z.string().trim().min(1, 'Unidade é obrigatória').max(50, 'Unidade muito longa'),
  estimated_unit_cost: z.number().nonnegative('Custo não pode ser negativo').max(1000000000, 'Custo muito alto').optional(),
  notes: z.string().trim().max(500, 'Notas muito longas').optional(),
  invoice_number: z.string().trim().max(100, 'Número da nota fiscal muito longo').optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
