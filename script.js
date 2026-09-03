// ==================== DADOS GLOBAIS ====================
let clientes = [];
let veiculos = [];
let estacionados = [];
let historicoPagamentos = [];

// Carregar dados
function carregarDados() {
  if (localStorage.getItem('clientes')) clientes = JSON.parse(localStorage.getItem('clientes'));
  if (localStorage.getItem('veiculos')) veiculos = JSON.parse(localStorage.getItem('veiculos'));
  if (localStorage.getItem('estacionados')) estacionados = JSON.parse(localStorage.getItem('estacionados'));
  if (localStorage.getItem('historicoPagamentos')) historicoPagamentos = JSON.parse(localStorage.getItem('historicoPagamentos'));
}
carregarDados();

// ==================== MUDAR DE TELA ====================
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
    section.classList.add('hidden');
  });

  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
    section.classList.remove('hidden');
  }

  if (sectionId === 'vagas') atualizarVagas();
  if (sectionId === 'clientes') listarClientes();
  if (sectionId === 'entrada') listarEstacionados();
  if (sectionId === 'relatorios') mostrarRelatorios();
}

// ==================== VAGAS ====================
function atualizarVagas() {
  const container = document.getElementById('vagas-container');
  container.innerHTML = `
    <p><strong>Total de Vagas:</strong> 120</p>
    <p><strong>Normais Disponíveis:</strong> 85</p>
    <p><strong>Especiais (PCD):</strong> 20</p>
    <p><strong>VIP:</strong> 10</p>
    <p><strong>Ocupadas:</strong> 35</p>
  `;
}

// ==================== CLIENTES ====================
document.getElementById('form-cliente').addEventListener('submit', (e) => {
  e.preventDefault();
  const cliente = {
    cpf: document.getElementById('cpf').value,
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    rg: document.getElementById('rg').value
  };
  clientes.push(cliente);
  localStorage.setItem('clientes', JSON.stringify(clientes));
  alert('✅ Cliente cadastrado!');
  listarClientes();
  e.target.reset();
});

function listarClientes() {
  const container = document.getElementById('lista-clientes');
  container.innerHTML = '<h3>Clientes Cadastrados:</h3>';
  clientes.forEach(c => {
    container.innerHTML += `<p><strong>${c.nome}</strong> - CPF: ${c.cpf}</p>`;
  });
}

// ==================== VEÍCULOS ====================
document.getElementById('form-veiculo').addEventListener('submit', (e) => {
  e.preventDefault();
  const dados = {
    placa: document.getElementById('placa').value.toUpperCase(),
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value,
    ano: document.getElementById('ano').value,
    cor: document.getElementById('cor').value,
    tamanho: document.getElementById('tamanho').value
  };
  const cpf = document.getElementById('cpf-veiculo').value;
  
  veiculos.push({ cpf, ...dados });
  localStorage.setItem('veiculos', JSON.stringify(veiculos));
  alert('✅ Veículo cadastrado!');
  renderizarVeiculos(cpf);
  e.target.reset();
});

function renderizarVeiculos(cpf) {
  const container = document.getElementById('veiculos-cliente');
  const veiculosCliente = veiculos.filter(v => v.cpf === cpf);
  let html = "<h4>Veículos:</h4>";
  veiculosCliente.forEach(v => {
    html += `<p>🚗 ${v.placa} - ${v.marca} ${v.modelo} (${v.cor})</p>`;
  });
  container.innerHTML = html;
}

// ==================== ENTRADA E SAÍDA ====================
window.registrarEntrada = function() {
  const placa = document.getElementById('placa-entrada').value.trim().toUpperCase();
  if (!placa) return alert("❌ Digite a placa!");
  
  estacionados.push({ placa, entrada: new Date().toISOString() });
  localStorage.setItem('estacionados', JSON.stringify(estacionados));
  alert(`🚗 ${placa} registrado na ENTRADA!`);
  listarEstacionados();
  document.getElementById('placa-entrada').value = '';
};

window.registrarSaida = function() {
  const placa = prompt("Digite a placa do veículo que está saindo:").toUpperCase().trim();
  if (!placa) return;

  const index = estacionados.findIndex(v => v.placa === placa);
  if (index === -1) return alert("❌ Veículo não encontrado!");

  estacionados.splice(index, 1);
  localStorage.setItem('estacionados', JSON.stringify(estacionados));
  alert(`✅ Saída registrada para ${placa}!`);
  listarEstacionados();
};

function listarEstacionados() {
  const container = document.getElementById('lista-estacionados');
  container.innerHTML = '';
  if (estacionados.length === 0) {
    container.innerHTML = '<p>Nenhum veículo estacionado no momento.</p>';
    return;
  }
  estacionados.forEach(v => {
    container.innerHTML += `<p>🚗 <strong>${v.placa}</strong></p>`;
  });
}

// ==================== CÁLCULO SEPARADO ====================
let valorCalculado = 0;
let tempoCalculado = "";

window.calcularValor = function() {
  const tipo = document.getElementById('tipo-tempo').value;
  const quantidade = parseFloat(document.getElementById('quantidade-tempo').value);

  if (!quantidade || quantidade <= 0) {
    return alert("Digite uma quantidade válida!");
  }

  if (tipo === "horas") {
    valorCalculado = quantidade * 10;
    tempoCalculado = `${quantidade} hora(s)`;
  } else if (tipo === "dias") {
    valorCalculado = quantidade * 240;
    tempoCalculado = `${quantidade} dia(s)`;
  } else if (tipo === "meses") {
    valorCalculado = quantidade * 550;
    tempoCalculado = `${quantidade} mês(es)`;
  }

  document.getElementById('calculo-resultado').innerHTML = `
    <strong>Valor Calculado:</strong><br>
    Tempo: ${tempoCalculado}<br>
    <strong>Total a Pagar: R$ ${valorCalculado.toFixed(2)}</strong><br><br>
    <small>Agora preencha a placa e clique em "Registrar Pagamento"</small>
  `;
};

// ==================== REGISTRAR PAGAMENTO ====================
window.registrarPagamento = function() {
  const placa = document.getElementById('placa-pagamento').value.trim().toUpperCase();
  
  if (!placa) return alert("Digite a placa do veículo!");
  if (valorCalculado <= 0) return alert("Primeiro calcule o valor!");

  const forma = prompt("Forma de Pagamento:\n1 - Dinheiro\n2 - Cartão\n3 - PIX\nDigite o número:");
  let metodo = "Dinheiro";
  if (forma === "2") metodo = "Cartão";
  if (forma === "3") metodo = "PIX";

  const pagamento = {
    data: new Date().toLocaleString('pt-BR'),
    placa: placa,
    tempo: tempoCalculado,
    valor: valorCalculado.toFixed(2),
    metodo: metodo
  };

  historicoPagamentos.push(pagamento);
  localStorage.setItem('historicoPagamentos', JSON.stringify(historicoPagamentos));

  alert(`✅ Pagamento registrado com sucesso!\nValor: R$ ${valorCalculado.toFixed(2)}`);

  // Limpa campos
  document.getElementById('placa-pagamento').value = '';
  document.getElementById('calculo-resultado').innerHTML = '<p>Pagamento registrado. Faça um novo cálculo.</p>';
  valorCalculado = 0;
};

// ==================== RELATÓRIOS ====================
function mostrarRelatorios() {
  const container = document.getElementById('relatorio-container');
  let html = `<h3>Relatório Geral</h3>`;
  html += `<p><strong>Clientes:</strong> ${clientes.length}</p>`;
  html += `<p><strong>Veículos:</strong> ${veiculos.length}</p>`;
  html += `<p><strong>Estacionados agora:</strong> ${estacionados.length}</p>`;

  html += `<h3>📋 Histórico de Pagamentos (${historicoPagamentos.length})</h3>`;
  
  if (historicoPagamentos.length === 0) {
    html += "<p>Nenhum pagamento registrado.</p>";
  } else {
    historicoPagamentos.forEach(p => {
      html += `<p><strong>${p.data}</strong> — ${p.placa} | ${p.tempo} → R$ ${p.valor} (${p.metodo})</p>`;
    });
  }
  container.innerHTML = html;
}

window.gerarRelatorioCompleto = mostrarRelatorios;

// ==================== INICIALIZAÇÃO ====================
showSection('vagas');