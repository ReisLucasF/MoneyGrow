document.getElementById('buscar-btn').addEventListener('click', function() {
    const ticker = document.getElementById('ticker-input').value;
    if (ticker) {
        buscarDadosAtivo(ticker);
    } else {
        alert('Por favor, insira um ticker.');
    }
});

async function buscarDadosAtivo(ticker) {
    try {
        const response = await fetch(`https://pecoteto.vercel.app/preco_teto/${ticker}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados. Verifique o ticker ou tente novamente mais tarde.');
        }

        const dados = await response.json();
        exibirResultado(ticker.toUpperCase(), dados);
    } catch (error) {
        document.getElementById('resultado').innerHTML = `<h3>${error.message}</h3>`;
        document.getElementById('resultado').style.display = 'block';
    }
}

function exibirResultado(ticker, dados) {
    let dividendos = '';
    for (let ano in dados.dividendos_ultimos_5_anos) {
        dividendos += `<p><strong>${ano}</strong>: R$ ${dados.dividendos_ultimos_5_anos[ano].toFixed(2)}</p>`;
    }

    // Verifica se a cotação atual é maior que o preço teto
    const classeCotacao = dados.cotacao_atual > dados.preco_teto ? 'red' : 'green';

    const html = `
        <h2>${ticker}</h2>
        <p><strong class="${classeCotacao}">R$ ${dados.cotacao_atual.toFixed(2)}</strong><br><span>Cotação Atual:</span></p>
        <p><strong>R$ ${dados.preco_teto.toFixed(2)}</strong><br><span>Preço Teto:</span></p>
    `;


    document.getElementById('resultado').innerHTML = html;
    document.getElementById('resultado').style.display = 'block';
}

