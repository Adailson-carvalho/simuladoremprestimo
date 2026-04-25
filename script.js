// 🔥 IMPORTS FIREBASE (VERSÃO MODERNA)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 SEU CONFIG (JÁ AJUSTADO)
const firebaseConfig = {
  apiKey: "AIzaSyAjI1AyErn_aYR48qbpzLwN6hvP8aPcg1Q",
  authDomain: "emprestimo-ads.firebaseapp.com",
  projectId: "emprestimo-ads",
  storageBucket: "emprestimo-ads.firebasestorage.app",
  messagingSenderId: "966415143870",
  appId: "1:966415143870:web:2e13dd286dfa247dfe9fef",
  measurementId: "G-QLRJND985S"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =============================

let total = 0;
let parcela = 0;
let taxaAplicada = 0;

function formatarData(data) {
  if (!data) return "";
  let d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// 🔥 FUNÇÕES GLOBAIS
window.calcular = function () {
  let valor = parseFloat(document.getElementById("valor").value);
  let n = parseInt(document.getElementById("parcelas").value);
  let dataPagamento = document.getElementById("dataPagamento").value;

  // 🔥 evita erro com campos vazios
  if (!valor || !n) {
    document.getElementById("resultado").innerHTML = "";
    return;
  }

  let juros = valor <= 999.99 ? 0.10 : 0.07;

  let fator = Math.pow(1 + juros, n);
  parcela = valor * (juros * fator) / (fator - 1);

  total = parcela * n;
  taxaAplicada = Math.round(juros * 100);

  document.getElementById("resultado").innerHTML = `
    <strong>Taxa aplicada:</strong> ${taxaAplicada}% <br>
    <strong>Parcela:</strong> ${formatarMoeda(parcela)} <br>
    <strong>Total:</strong> ${formatarMoeda(total)} <br>
    <strong>Data:</strong> ${formatarData(dataPagamento)}
  `;
};

window.enviarWhats = async function () {

  // 🔥 GARANTE QUE O CÁLCULO FOI FEITO
  calcular();

  let nome = document.getElementById("nome").value;
  let telefone = document.getElementById("telefone").value;
  let valor = document.getElementById("valor").value;
  let parcelasQtd = document.getElementById("parcelas").value;
  let dataPagamento = document.getElementById("dataPagamento").value;

  let numero = "5511977816342";

  let mensagem = `Olá, gostaria de solicitar um empréstimo:

Nome: ${nome}
Telefone: ${telefone}
Valor: R$ ${valor}
Parcelas: ${parcelasQtd}
Data: ${formatarData(dataPagamento)}

Simulação:
Taxa: ${taxaAplicada}%
Parcela: ${formatarMoeda(parcela)}
Total: ${formatarMoeda(total)}`;

  let url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.location.href = url;

  try {
    await addDoc(collection(db, "clientes"), {
      nome,
      telefone,
      valor,
      parcelas: parcelasQtd,
      dataPagamento,
      parcela,
      total,
      taxa: taxaAplicada,
      criadoEm: new Date()
    });
  } catch (e) {
    console.error("Erro ao salvar:", e);
  }

  setTimeout(() => {
    limparCampos();
  }, 1000);
};

window.limparCampos = function () {
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("parcelas").value = "";
  document.getElementById("dataPagamento").value = "";
  document.getElementById("resultado").innerHTML = "";

  total = 0;
  parcela = 0;
  taxaAplicada = 0;
};

// 🔥 CAMPOS QUE DISPARAM O CÁLCULO
const campos = ["valor", "parcelas", "dataPagamento"];

campos.forEach(id => {
  document.getElementById(id).addEventListener("input", calcular);
});