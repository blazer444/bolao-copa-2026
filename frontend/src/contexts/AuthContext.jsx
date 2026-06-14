import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import api from '../services/api';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sessão persistente via Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(error.message);
    return data;
  }

  async function cadastro(nome, email, senha) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) throw new Error(error.message);

    // Cria perfil
    if (data.user) {
      await supabase.from('usuarios').insert({ id: data.user.id, nome, email });
    }
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function recuperarSenha(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    });
    if (error) throw new Error(error.message);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, cadastro, logout, recuperarSenha }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
