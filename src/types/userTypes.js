/**
 * Definições de tipos e constantes para usuários
 */

const USER_ROLES = {
  ADMINALL: 'adminall',     // Acesso total ao sistema
  ADMIN: 'admin',           // Administrador com permissões específicas
  MANAGER: 'manager',       // Gerente/Supervisor
  USER: 'user',             // Usuário padrão
  VIEWER: 'viewer'          // Apenas visualização
};

const USER_STATUS = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  SUSPENSO: 'SUSPENSO'
};

const LOGIN_STATUS = {
  LOGADO: 'LOGADO',
  OFFLINE: 'OFFLINE'
};

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const DEFAULT_PERMISSIONS = {
  modules: { type: 'all' },
  views: { type: 'all' }
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  LOGIN_STATUS,
  ESTADOS_BRASIL,
  DEFAULT_PERMISSIONS
};