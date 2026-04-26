// ------------------------ MÁSCARA DE VALOR MONETÁRIO -------------------------
function applyMoneyMask(value) {
  let cleanValue = value.replace(/\D/g, '');
  if (cleanValue === '') return '';
  let numberValue = parseFloat(cleanValue) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getRawMoneyValue(maskedValue) {
  if (!maskedValue) return 0;
  let cleanValue = maskedValue.replace(/\D/g, '');
  if (cleanValue === '') return 0;
  return parseFloat(cleanValue) / 100;
}

// ------------------------ FUNÇÃO PARA FORMATAR DATA EXIBIÇÃO -----------------
function formatDateToBr(dateISO) {
  if (!dateISO) return "";
  const parts = dateISO.split("-");
  if (parts.length !== 3) return dateISO;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ------------------------ FUNÇÃO PRINCIPAL DE CÁLCULO -------------------------
window.calcular = function () {
  const valorInput = document.getElementById("valor");
  let valor = getRawMoneyValue(valorInput.value);
  let n = parseInt(document.getElementById("parcelas").value);
  let dataPagamentoISO = document.getElementById("dataPagamento").value;

  if (isNaN(valor) || valor === 0 || isNaN(n) || !n) {
    document.getElementById("resultado").innerHTML = '<span style="opacity:0.7;">Preencha os campos acima</span>';
    return;
  }

  let juros = valor <= 999.99 ? 0.10 : 0.07;
  let fator = Math.pow(1 + juros, n);
  let parcela = valor * (juros * fator) / (fator - 1);
  let total = parcela * n;
  let taxaAplicada = Math.round(juros * 100);

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  }

  let dataFormatada = dataPagamentoISO ? formatDateToBr(dataPagamentoISO) : "Não informada";
  let parcelaFormatada = formatarMoeda(parcela);
  let totalFormatado = formatarMoeda(total);

  document.getElementById("resultado").innerHTML = `
    <strong>📊 Taxa aplicada:</strong> ${taxaAplicada}% 
    <span class="tax-badge">${valor <= 999.99 ? "até R$999,99" : "acima R$1.000"}</span><br>
    <strong>💵 Parcela:</strong> ${parcelaFormatada} <br>
    <strong>💰 Total:</strong> ${totalFormatado} <br>
    <strong>📅 Data (1ª parcela):</strong> ${dataFormatada}
  `;
};

// ------------------------ MÁSCARA DE TELEFONE ---------------------------------
function applyPhoneMask(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
  let formatted = '';
  if (cleaned.length <= 2) {
    formatted = `(${cleaned}`;
  } else if (cleaned.length <= 6) {
    formatted = `(${cleaned.slice(0,2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 10) {
    formatted = `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
  } else {
    formatted = `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7,11)}`;
  }
  return formatted;
}

function getRawPhone(phoneStr) {
  return phoneStr.replace(/\D/g, '');
}

// ------------------------ TOAST MESSAGES --------------------------------------
function showToastMessage(msg, isSuccess = true) {
  const toast = document.getElementById('toastMsg');
  toast.innerHTML = isSuccess ? `✅ ${msg}` : `⚠️ ${msg}`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ------------------------ GERA MENSAGEM PARA WHATSAPP -------------------------
function generateWhatsAppMessage() {
  const nome = document.getElementById("nome").value.trim();
  let telefone = document.getElementById("telefone").value.trim();
  const valorInput = document.getElementById("valor");
  let valor = getRawMoneyValue(valorInput.value);
  let n = parseInt(document.getElementById("parcelas").value);
  let dataPagamentoISO = document.getElementById("dataPagamento").value;
  let dataPagamentoBr = formatDateToBr(dataPagamentoISO);

  if (nome === "") {
    showToastMessage("Por favor, informe seu nome completo.", false);
    return null;
  }
  if (telefone === "") {
    showToastMessage("Informe seu telefone para contato.", false);
    return null;
  }
  const rawPhone = getRawPhone(telefone);
  if (rawPhone.length < 10 || rawPhone.length > 11) {
    showToastMessage("Telefone inválido. Use DDD + número (ex: 11999999999).", false);
    return null;
  }
  if (isNaN(valor) || valor < 50) {
    showToastMessage("Valor mínimo de empréstimo é R$ 50,00.", false);
    return null;
  }
  if (valor > 500000) {
    showToastMessage("Valor muito elevado, entre em contato com nossa equipe.", false);
    return null;
  }
  if (!n || n < 1) {
    showToastMessage("Selecione o número de parcelas.", false);
    return null;
  }
  if (!dataPagamentoISO) {
    showToastMessage("Selecione a data de pagamento da primeira parcela.", false);
    return null;
  }

  let juros = valor <= 999.99 ? 0.10 : 0.07;
  let fator = Math.pow(1 + juros, n);
  let parcela = valor * (juros * fator) / (fator - 1);
  let total = parcela * n;
  let taxaPercentual = Math.round(juros * 100);

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

  let parcelaFormat = formatMoney(parcela);
  let totalFormat = formatMoney(total);
  let valorFormat = formatMoney(valor);
  
  const mensagem = 
`*NOVA SIMULACAO DE EMPRESTIMO - ADS*
----------------------------------------

DADOS DO CLIENTE:
NOME: ${nome}
TELEFONE: ${telefone}

DADOS DA SIMULACAO:
VALOR SOLICITADO: ${valorFormat}
PARCELAS: ${n}x

VALOR DA PARCELA: ${parcelaFormat}
TOTAL A PAGAR: ${totalFormat}
DATA DA 1a PARCELA: ${dataPagamentoBr}
TAXA MENSAL APLICADA: ${taxaPercentual}%

----------------------------------------
*Aguarde! Em breve retornaremos o contato!*
----------------------------------------`;

  return mensagem;
}

// ------------------------ ENVIO PARA WHATSAPP (NÚMERO FIXO) --------------------
function sendToWhatsApp() {
  const message = generateWhatsAppMessage();
  if (!message) return;
  
  const numeroConsultor = "5511977816342";
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${numeroConsultor}?text=${encodedMsg}`;
  window.open(whatsappUrl, '_blank');
  showToastMessage("Simulação enviada para o consultor! Redirecionando para o WhatsApp...", true);
}

// ------------------------ LIMPAR FORMULÁRIO -----------------------------------
function clearForm() {
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("parcelas").value = "1";
  
  // Data padrão: DIA DE HOJE no formato ISO (yyyy-mm-dd)
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  document.getElementById("dataPagamento").value = `${ano}-${mes}-${dia}`;
  
  window.calcular();
  showToastMessage("Todos os campos foram limpos. Simulação reiniciada.", true);
}

// ------------------------ CONFIGURAÇÃO INICIAL -------------------------------
function setInitialDate() {
  // Define a data como o dia de hoje no formato ISO (yyyy-mm-dd)
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  document.getElementById("dataPagamento").value = `${ano}-${mes}-${dia}`;
}

function bindEvents() {
  const valorInput = document.getElementById("valor");
  const parcelasInput = document.getElementById("parcelas");
  const dataInput = document.getElementById("dataPagamento");

  valorInput.addEventListener("input", function(e) {
    let rawValue = e.target.value;
    let masked = applyMoneyMask(rawValue);
    e.target.value = masked;
    window.calcular();
  });
  
  parcelasInput.addEventListener("input", function() {
    let val = parseInt(parcelasInput.value);
    if (isNaN(val) || val < 1) parcelasInput.value = 1;
    if (val > 12) parcelasInput.value = 12;
    window.calcular();
  });
  
  parcelasInput.addEventListener("change", function() {
    let val = parseInt(parcelasInput.value);
    if (isNaN(val) || val < 1) parcelasInput.value = 1;
    if (val > 12) parcelasInput.value = 12;
    window.calcular();
  });
  
  dataInput.addEventListener("change", function() {
    window.calcular();
  });
}

// ------------------------ INICIALIZAÇÃO ---------------------------------------
window.addEventListener("DOMContentLoaded", function() {
  setInitialDate();
  bindEvents();
  window.calcular();
  
  const telefoneField = document.getElementById("telefone");
  telefoneField.addEventListener("input", function(e) {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.slice(0, 11);
    const masked = applyPhoneMask(raw);
    e.target.value = masked;
  });
  
  document.getElementById("btnWhatsapp").addEventListener("click", sendToWhatsApp);
  document.getElementById("btnLimpar").addEventListener("click", clearForm);
});