let currentInvestmentIndex = 0;
let investmentsKeys = [];
let resultados = {};

function plotAllInvestments() {
    const container = document.getElementById('container');
    const melhoresOPC = document.getElementById('melhoresOPC');

    const seriesData = investmentsKeys.map(investmentKey => ({
        name: investmentKey,
        data: resultados[investmentKey].evolution
    }));

    Highcharts.chart('container', {
        title: {
            text: 'Evolução do Patrimônio - Comparação de Investimentos'
        },
        xAxis: {
            categories: resultados[investmentsKeys[0]].evolution.map((_, i) => i + 1)
        },
        yAxis: {
            title: {
                text: 'Patrimônio (R$)'
            },
            labels: {
                formatter: function () {
                    return this.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            }
        },
        tooltip: {
            pointFormatter: function () {
                return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b><br/>`;
            }
        },
        series: seriesData
    });

    container.style.display = 'block';
    melhoresOPC.style.display = 'block';
}



// consumo da API do BCB para buscar o último CDI
async function buscarUltimoCDI() {
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json';
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) {
            throw new Error('Falha ao obter dados do CDI');
        }
        const dados = await resposta.json();
        return parseFloat(dados[0].valor);
    } catch (erro) {
        console.error('Erro ao buscar CDI:', erro);
        // return 10.40;  
    }
}

// calcular juros compostos com aplicação de IR
function jurosCompostos(capitalInicial, taxa, tempo, aporteMensal, tributavel) {
    let montante = capitalInicial;
    let evolution = [];
    for (let i = 0; i < tempo * 12; i++) {
        montante = (montante + aporteMensal) * (1 + taxa / 12);
        evolution.push(montante);
    }

    let contribuicaoTotal = capitalInicial + aporteMensal * tempo * 12;
    let lucro = montante - contribuicaoTotal;

    if (tributavel) {
        let taxaIR = obterTaxaIR(tempo);
        lucro *= (1 - taxaIR);
    }

    let retornoLiquido = contribuicaoTotal + lucro;
    let retornoSemInicial = retornoLiquido - capitalInicial;
    let retornoMensalMedio = (tempo > 2 / 12) ? lucro / (tempo * 12) : 0;

    return {
        retornoLiquido,
        retornoSemInicial,
        retornoMensalMedio,
        evolution
    };
}

function obterTaxaIR(anos) {
    if (anos <= 0.5) return 0.225;
    else if (anos <= 1) return 0.20;
    else if (anos <= 2) return 0.175;
    else return 0.15;
}

function anualizarCDI(taxaDiaria) {
    const diasUteisAno = 252;
    const taxaDiariaDecimal = taxaDiaria / 100;
    const taxaAnualizada = (Math.pow(1 + taxaDiariaDecimal, diasUteisAno) - 1) * 100;
    return taxaAnualizada;
}

async function calcularRetornos() {


    const investimentoInicial = parseFloat(document.getElementById('initialInvestment').value) || 0;
    const aporteMensal = parseFloat(document.getElementById('monthlyContribution').value) || 0;
    const periodoInvestimento = parseInt(document.getElementById('investmentPeriod').value) || 0;
    const tipoPeriodo = document.getElementById('periodType').value;
    const anos = tipoPeriodo === 'months' ? periodoInvestimento / 12 : periodoInvestimento;

    const taxaCDIDecimal = await buscarUltimoCDI();
    const taxaCDIAnual = anualizarCDI(taxaCDIDecimal);

    if (!investimentoInicial || !periodoInvestimento) {
        alert('Preencha os campos corretamente');
        return;
    }

    const taxas = {
        selic: taxaCDIAnual / 100,
        cdi: taxaCDIAnual / 100,
        ipca: 0.0361,
        tr: 0.00092,
        tesouroPrefixado: 0.105,
        tesouroIPCA: 0.055,
        fundoDI: 0.09817,
        cdb: taxaCDIAnual / 100,
        lciLca: (taxaCDIAnual / 100) * 0.85,
        poupanca: 0.05925 / 12
    };

    resultados = {
        'LCI e LCA': jurosCompostos(investimentoInicial, taxas.lciLca, anos, aporteMensal, false),
        'CDB': jurosCompostos(investimentoInicial, taxas.cdb, anos, aporteMensal, true),
        'Tesouro Prefixado': jurosCompostos(investimentoInicial, taxas.tesouroPrefixado, anos, aporteMensal, true),
        'Tesouro Selic': jurosCompostos(investimentoInicial, taxas.selic, anos, aporteMensal, false),
        'Fundo DI': jurosCompostos(investimentoInicial, taxas.fundoDI, anos, aporteMensal, true),
        'Tesouro IPCA+': jurosCompostos(investimentoInicial, taxas.tesouroIPCA, anos, aporteMensal, true),
        'Correção pelo IPCA': jurosCompostos(investimentoInicial, taxas.ipca, anos, aporteMensal, false)
    };

    investmentsKeys = Object.keys(resultados);

    plotAllInvestments();

    exibirResultados(resultados);
}

function exibirResultados(resultados) {
    const containerResultados = document.getElementById('results');
    containerResultados.innerHTML = '';

    const tabela = document.createElement('table');
    tabela.setAttribute('id', 'resultsTable');
    const linhaCabecalho = tabela.insertRow();
    const cabecalhos = ["Investimento", "Retorno Líquido", "Retorno Mensal Médio"];
    cabecalhos.forEach(textoCabecalho => {
        let cabecalho = document.createElement('th');
        cabecalho.textContent = textoCabecalho;
        linhaCabecalho.appendChild(cabecalho);
    });

    Object.entries(resultados).forEach(([chave, valor]) => {
        const linha = tabela.insertRow();
        const celulaNome = linha.insertCell();
        celulaNome.textContent = chave;
        const celulaRetornoLiquido = linha.insertCell();
        celulaRetornoLiquido.textContent = formatarMoeda(valor.retornoSemInicial);
        const celulaRetornoMensal = linha.insertCell();
        celulaRetornoMensal.textContent = formatarMoeda(valor.retornoMensalMedio);
    });

    containerResultados.appendChild(tabela);
}


function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.getElementById('calculateButton').addEventListener('click', calcularRetornos);
