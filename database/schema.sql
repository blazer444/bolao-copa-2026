-- ============================================================
-- BOLÃO COPA DO MUNDO 2026 - Schema PostgreSQL (Supabase)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: boloes
-- ============================================================
CREATE TABLE boloes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo_convite VARCHAR(10) UNIQUE NOT NULL,
  criador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  publico BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  -- Configuração de pontuação
  pts_acertou_vencedor INT DEFAULT 3,
  pts_acertou_empate INT DEFAULT 3,
  pts_acertou_saldo INT DEFAULT 5,
  pts_acertou_placar_exato INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: participantes
-- ============================================================
CREATE TABLE participantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, bolao_id)
);

-- ============================================================
-- TABELA: jogos (populados via API de futebol)
-- ============================================================
CREATE TABLE jogos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id VARCHAR(50) UNIQUE, -- ID externo da API de futebol
  selecao_casa VARCHAR(100) NOT NULL,
  selecao_fora VARCHAR(100) NOT NULL,
  bandeira_casa TEXT,
  bandeira_fora TEXT,
  data_hora TIMESTAMPTZ NOT NULL,
  estadio VARCHAR(150),
  cidade VARCHAR(100),
  fase VARCHAR(50), -- 'Grupos', 'Oitavas', 'Quartas', 'Semi', 'Final'
  grupo VARCHAR(5),
  status VARCHAR(20) DEFAULT 'NAO_INICIADO', -- NAO_INICIADO | AO_VIVO | ENCERRADO
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: resultados
-- ============================================================
CREATE TABLE resultados (
  jogo_id UUID PRIMARY KEY REFERENCES jogos(id) ON DELETE CASCADE,
  gols_casa INT NOT NULL DEFAULT 0,
  gols_fora INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: palpites
-- ============================================================
CREATE TABLE palpites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  jogo_id UUID NOT NULL REFERENCES jogos(id) ON DELETE CASCADE,
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  gols_casa INT NOT NULL CHECK (gols_casa >= 0),
  gols_fora INT NOT NULL CHECK (gols_fora >= 0),
  pontos_obtidos INT DEFAULT 0,
  calculado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, jogo_id, bolao_id)
);

-- ============================================================
-- TABELA: pontuacoes (cache do ranking)
-- ============================================================
CREATE TABLE pontuacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  pontos_total INT DEFAULT 0,
  acertos_vencedor INT DEFAULT 0,
  acertos_saldo INT DEFAULT 0,
  acertos_placar_exato INT DEFAULT 0,
  total_palpites INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, bolao_id)
);

-- ============================================================
-- TABELA: palpites_especiais
-- ============================================================
CREATE TABLE palpites_especiais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'CAMPEAO' | 'VICE' | 'ARTILHEIRO' | 'MELHOR_JOGADOR' | 'SEMIFINALISTAS'
  resposta TEXT NOT NULL,
  pontos_configurados INT DEFAULT 20,
  pontos_obtidos INT DEFAULT 0,
  calculado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, bolao_id, tipo)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_palpites_usuario ON palpites(usuario_id);
CREATE INDEX idx_palpites_bolao ON palpites(bolao_id);
CREATE INDEX idx_palpites_jogo ON palpites(jogo_id);
CREATE INDEX idx_pontuacoes_bolao ON pontuacoes(bolao_id);
CREATE INDEX idx_pontuacoes_pontos ON pontuacoes(bolao_id, pontos_total DESC);
CREATE INDEX idx_participantes_bolao ON participantes(bolao_id);
CREATE INDEX idx_jogos_data ON jogos(data_hora);
CREATE INDEX idx_jogos_status ON jogos(status);

-- ============================================================
-- FUNCTIONS E TRIGGERS
-- ============================================================

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_boloes_updated_at BEFORE UPDATE ON boloes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_palpites_updated_at BEFORE UPDATE ON palpites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_jogos_updated_at BEFORE UPDATE ON jogos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- FUNCTION: calcular_pontuacao_palpite
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_pontuacao_palpite(
  p_palpite_id UUID
)
RETURNS INT AS $$
DECLARE
  v_palpite palpites%ROWTYPE;
  v_resultado resultados%ROWTYPE;
  v_bolao boloes%ROWTYPE;
  v_pontos INT := 0;
  v_vencedor_real VARCHAR;
  v_vencedor_palpite VARCHAR;
BEGIN
  SELECT * INTO v_palpite FROM palpites WHERE id = p_palpite_id;
  SELECT * INTO v_resultado FROM resultados WHERE jogo_id = v_palpite.jogo_id;
  SELECT * INTO v_bolao FROM boloes WHERE id = v_palpite.bolao_id;

  IF v_resultado IS NULL THEN
    RETURN 0;
  END IF;

  -- Determinar vencedor real
  IF v_resultado.gols_casa > v_resultado.gols_fora THEN v_vencedor_real := 'CASA';
  ELSIF v_resultado.gols_fora > v_resultado.gols_casa THEN v_vencedor_real := 'FORA';
  ELSE v_vencedor_real := 'EMPATE';
  END IF;

  -- Determinar vencedor palpitado
  IF v_palpite.gols_casa > v_palpite.gols_fora THEN v_vencedor_palpite := 'CASA';
  ELSIF v_palpite.gols_fora > v_palpite.gols_casa THEN v_vencedor_palpite := 'FORA';
  ELSE v_vencedor_palpite := 'EMPATE';
  END IF;

  -- Placar exato (+10)
  IF v_palpite.gols_casa = v_resultado.gols_casa AND v_palpite.gols_fora = v_resultado.gols_fora THEN
    v_pontos := v_pontos + v_bolao.pts_acertou_placar_exato;
  ELSE
    -- Saldo de gols (+5)
    IF (v_palpite.gols_casa - v_palpite.gols_fora) = (v_resultado.gols_casa - v_resultado.gols_fora) THEN
      v_pontos := v_pontos + v_bolao.pts_acertou_saldo;
    END IF;

    -- Acertou vencedor ou empate (+3)
    IF v_vencedor_palpite = v_vencedor_real THEN
      IF v_vencedor_real = 'EMPATE' THEN
        v_pontos := v_pontos + v_bolao.pts_acertou_empate;
      ELSE
        v_pontos := v_pontos + v_bolao.pts_acertou_vencedor;
      END IF;
    END IF;
  END IF;

  -- Atualiza o palpite
  UPDATE palpites SET pontos_obtidos = v_pontos, calculado = TRUE WHERE id = p_palpite_id;

  RETURN v_pontos;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: atualizar_pontuacao_bolao
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_pontuacao_bolao(
  p_jogo_id UUID,
  p_bolao_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_palpite palpites%ROWTYPE;
BEGIN
  FOR v_palpite IN
    SELECT * FROM palpites WHERE jogo_id = p_jogo_id AND bolao_id = p_bolao_id
  LOOP
    PERFORM calcular_pontuacao_palpite(v_palpite.id);
  END LOOP;

  -- Recalcula pontuacao total de cada participante
  INSERT INTO pontuacoes (usuario_id, bolao_id, pontos_total, total_palpites)
  SELECT
    p.usuario_id,
    p.bolao_id,
    COALESCE(SUM(p.pontos_obtidos), 0),
    COUNT(p.id)
  FROM palpites p
  WHERE p.bolao_id = p_bolao_id
  GROUP BY p.usuario_id, p.bolao_id
  ON CONFLICT (usuario_id, bolao_id)
  DO UPDATE SET
    pontos_total = EXCLUDED.pontos_total,
    total_palpites = EXCLUDED.total_palpites,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (Supabase)
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE boloes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE palpites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE palpites_especiais ENABLE ROW LEVEL SECURITY;

-- Usuarios: só pode ver/editar o próprio perfil
CREATE POLICY "usuarios_self" ON usuarios
  USING (auth.uid() = id);

-- Bolões: pode ver todos públicos, ver/editar os que participa
CREATE POLICY "boloes_publicos" ON boloes
  FOR SELECT USING (publico = TRUE OR criador_id = auth.uid());

CREATE POLICY "boloes_participante" ON boloes
  FOR SELECT USING (
    id IN (SELECT bolao_id FROM participantes WHERE usuario_id = auth.uid())
  );

CREATE POLICY "boloes_insert" ON boloes
  FOR INSERT WITH CHECK (criador_id = auth.uid());

CREATE POLICY "boloes_update" ON boloes
  FOR UPDATE USING (criador_id = auth.uid());

-- Palpites: só o próprio usuário pode criar/ver os seus
CREATE POLICY "palpites_own" ON palpites
  USING (usuario_id = auth.uid());

CREATE POLICY "palpites_insert" ON palpites
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Pontuações: todos participantes do bolão podem ver
CREATE POLICY "pontuacoes_view" ON pontuacoes
  FOR SELECT USING (
    bolao_id IN (SELECT bolao_id FROM participantes WHERE usuario_id = auth.uid())
  );

-- Participantes
CREATE POLICY "participantes_view" ON participantes
  FOR SELECT USING (
    bolao_id IN (SELECT bolao_id FROM participantes WHERE usuario_id = auth.uid())
  );

CREATE POLICY "participantes_insert" ON participantes
  FOR INSERT WITH CHECK (usuario_id = auth.uid());
