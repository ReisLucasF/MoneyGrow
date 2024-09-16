async function carregarConfiguracoes() {
    try {
        const response = await fetch('configuracoes.json');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar o arquivo JSON:', error);
    }
}

async function calcularDistribuicao() {
    const valorAporte = parseFloat(document.getElementById('valor-aporte').value);

    const resultadosContainer = document.getElementById('resultados');
    resultadosContainer.style.display = 'block';

    if (isNaN(valorAporte) || valorAporte <= 0) {
        alert("Por favor, insira um valor válido para o aporte.");
        return;
    }

    const configuracoes = await carregarConfiguracoes();

    const acoes = (valorAporte * configuracoes.acoes).toFixed(2);
    const brs = (valorAporte * configuracoes.brs).toFixed(2);
    const etfs = (valorAporte * configuracoes.etfs).toFixed(2);
    const fiis = (valorAporte * configuracoes.fiis).toFixed(2);
    const rendaFixa = (valorAporte * configuracoes.rendaFixa).toFixed(2);
    const cripto = (valorAporte * configuracoes.cripto).toFixed(2);

    // Atualizar os resultados na página, ocultando os que forem 0 ou nulos
    atualizarResultado('acoes-valor', acoes);
    atualizarResultado('brs-valor', brs);
    atualizarResultado('etfs-valor', etfs);
    atualizarResultado('fiis-valor', fiis);
    atualizarResultado('renda-fixa-valor', rendaFixa);
    atualizarResultado('cripto-valor', cripto);
}

function atualizarResultado(elementoId, valor) {
    const elemento = document.getElementById(elementoId);
    if (valor > 0) {
        elemento.innerText = formatarMoeda(valor);
        elemento.parentElement.style.display = 'block';
    } else {
        elemento.parentElement.style.display = 'none';
    }
}

function formatarMoeda(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}