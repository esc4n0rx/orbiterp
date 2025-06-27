/**
 * Utilitários de validação para o sistema
 */

/**
 * Valida CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se CPF for válido
 */
function validateCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CEP
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} True se CEP for válido
 */
function validateCEP(cep) {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
}

/**
 * Valida telefone
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} True se telefone for válido
 */
function validatePhone(telefone) {
  // Remove caracteres não numéricos
  const cleanPhone = telefone.replace(/[^\d]/g, '');
  
  // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 no celular)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se email for válido
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida username
 * @param {string} username - Username a ser validado
 * @returns {boolean} True se username for válido
 */
function validateUsername(username) {
  // Username deve ter entre 3 e 30 caracteres, apenas letras, números e underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Formata CPF
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} CPF formatado
 */
function formatCPF(cpf) {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CEP
 * @param {string} cep - CEP a ser formatado
 * @returns {string} CEP formatado
 */
function formatCEP(cep) {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Valida estrutura de permissões
 * @param {Object} permissions - Objeto de permissões
 * @returns {boolean} True se estrutura for válida
 */
function validatePermissions(permissions) {
  if (!permissions || typeof permissions !== 'object') return false;
  
  // Estrutura permitida: { type: "all" } ou { type: "specific", modules: [...] }
  if (permissions.type === 'all') return true;
  
  if (permissions.type === 'specific') {
    return Array.isArray(permissions.modules);
  }
  
  return false;
}

module.exports = {
  validateCPF,
  validateCEP,
  validatePhone,
  validateEmail,
  validateUsername,
  formatCPF,
  formatCEP,
  validatePermissions
};