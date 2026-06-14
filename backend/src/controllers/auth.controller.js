import { supabase } from '../config/supabase.js';
import { z } from 'zod';

const cadastroSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  senha: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function cadastro(req, res, next) {
  try {
    const { nome, email, senha } = cadastroSchema.parse(req.body);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (error) return res.status(400).json({ error: error.message });

    // Cria registro na tabela usuarios
    await supabase.from('usuarios').insert({
      id: data.user.id,
      nome,
      email,
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) return res.status(401).json({ error: 'Email ou senha inválidos' });

    return res.json({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      usuario: {
        id: data.user.id,
        email: data.user.email,
        nome: data.user.user_metadata?.nome,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await supabase.auth.admin.signOut(token);
    return res.json({ message: 'Logout realizado' });
  } catch (err) {
    next(err);
  }
}

export async function recuperarSenha(req, res, next) {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Email de recuperação enviado' });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Email inválido' });
    }
    next(err);
  }
}
