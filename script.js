// ------------------------ FUNÇÃO PRINCIPAL DE CÁLCULO -------------------------
window.calcular = function () {
  let valor = parseFloat(document.getElementById("valor").value);
  let n = parseInt(document.getElementById("parcelas").value);
  let dataPagamento = document.getElementById("dataPagamento").value;

  if (isNaN(valor) || !valor || isNaN(n) || !n) {
    document.getElementById("resultado").innerHTML = "";
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

  function formatarData(dataISO) {
    if (!dataISO) return "Não informada";
    let partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  let dataFormatada = formatarData(dataPagamento);
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
  let valor = parseFloat(document.getElementById("valor").value);
  let n = parseInt(document.getElementById("parcelas").value);
  let dataPagamento = document.getElementById("dataPagamento").value;

  if (nome === "") {
    showToastMessage("Por favor, informe seu nome completo.", false);
    return null;
  }
  if (telefone === "") {
    showToastMessage("Informe seu telefone para contato via WhatsApp.", false);
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
  if (!dataPagamento) {
    showToastMessage("Selecione a data de pagamento da primeira parcela.", false);
    return null;
  }

  let juros = valor <= 999.99 ? 0.10 : 0.07;
  let fator = Math.pow(1 + juros, n);
  let parcela = valor * (juros * fator) / (fator - 1);
  let total = parcela * n;
  let taxaPercentual = Math.round(juros * 100);

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  const formatDateBr = (isoDate) => {
    if (!isoDate) return "Não informada";
    let parts = isoDate.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  let parcelaFormat = formatMoney(parcela);
  let totalFormat = formatMoney(total);
  let valorFormat = formatMoney(valor);
  let dataFormatada = formatDateBr(dataPagamento);
  
  let regimeJuros = valor <= 999.99 ? "TAXA ESPECIAL: 10% ao mês (valores ate R$ 999,99)" : "TAXA REDUZIDA: 7% ao mês (acima de R$ 1.000)";

  // MENSAGEM SEM EMOJIS - APENAS TEXTO PURO PARA GARANTIR FUNCIONAMENTO
  const mensagem = 
`SIMULADOR ADS - CREDITO PESSOAL
----------------------------------------

NOME: ${nome}
TELEFONE: ${telefone}
VALOR SOLICITADO: ${valorFormat}
PARCELAS: ${n}x

VALOR DA PARCELA: ${parcelaFormat}
TOTAL A PAGAR: ${totalFormat}
DATA DA 1° PARCELA: ${dataFormatada}
TAXA MENSAL APLICADA: ${taxaPercentual}%

----------------------------------------
*Simulacao gerada via sistema*
*Aguarde! Em breve retornaremos!*
----------------------------------------`;

  return mensagem;
}

// ------------------------ ENVIO PARA WHATSAPP ---------------------------------
function sendToWhatsApp() {
  const message = generateWhatsAppMessage();
  if (!message) return;
  
  let telefoneRaw = getRawPhone(document.getElementById("telefone").value);
  if (telefoneRaw.length === 10) telefoneRaw = `55${telefoneRaw}`;
  else if (telefoneRaw.length === 11) telefoneRaw = `55${telefoneRaw}`;
  else telefoneRaw = `55${telefoneRaw}`;
  
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${telefoneRaw}?text=${encodedMsg}`;
  window.open(whatsappUrl, '_blank');
  showToastMessage("Redirecionando para o WhatsApp com sua simulacao!", true);
}

// ------------------------ LIMPAR FORMULÁRIO -----------------------------------
function clearForm() {
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("valor").value = "2500";
  document.getElementById("parcelas").value = "3";
  
  const today = new Date();
  let futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 5);
  let year = futureDate.getFullYear();
  let month = String(futureDate.getMonth() + 1).padStart(2, '0');
  let day = String(futureDate.getDate()).padStart(2, '0');
  document.getElementById("dataPagamento").value = `${year}-${month}-${day}`;
  
  window.calcular();
  showToastMessage("Todos os campos foram limpos. Simulacao reiniciada.", true);
}

// ------------------------ CONFIGURAÇÃO INICIAL -------------------------------
function setInitialDate() {
  if (!document.getElementById("dataPagamento").value) {
    const hoje = new Date();
    const dataPadrao = new Date(hoje);
    dataPadrao.setDate(hoje.getDate() + 5);
    const ano = dataPadrao.getFullYear();
    const mes = String(dataPadrao.getMonth() + 1).padStart(2, '0');
    const dia = String(dataPadrao.getDate()).padStart(2, '0');
    document.getElementById("dataPagamento").value = `${ano}-${mes}-${dia}`;
  }
}

function bindEvents() {
  const valorInput = document.getElementById("valor");
  const parcelasSelect = document.getElementById("parcelas");
  const dataInput = document.getElementById("dataPagamento");

  valorInput.addEventListener("input", function() {
    window.calcular();
  });
  parcelasSelect.addEventListener("change", function() {
    window.calcular();
  });
  dataInput.addEventListener("change", function() {
    window.calcular();
  });
  
  valorInput.addEventListener("blur", function() {
    let v = parseFloat(valorInput.value);
    if (!isNaN(v)) valorInput.value = v.toFixed(2);
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