// Função para adicionar mais inputs de dividendos
document.getElementById('add-dividendo').addEventListener('click', function () {
    const container = document.getElementById('dividendos-container');
    const newDividendoInput = document.createElement('div');
    newDividendoInput.classList.add('mb-3');
    newDividendoInput.innerHTML = '<input type="number" class="form-control dividendos" placeholder="Digite o dividendo anual">';
    container.appendChild(newDividendoInput);
});

// Função para calcular o yeld médio e preço teto
function calcular() {
    // Obter a cotação
    const cotacao = parseFloat(document.getElementById('cotacao').value);

    if (isNaN(cotacao) || cotacao <= 0) {
        alert("Por favor, insira um valor válido para a cotação.");
        return;
    }

    // Obter todos os dividendos
    const dividendos = Array.from(document.getElementsByClassName('dividendos')).map(input => parseFloat(input.value));

    // Verificar se os dividendos são válidos
    if (dividendos.some(isNaN)) {
        alert("Por favor, insira valores válidos para todos os dividendos.");
        return;
    }

    // Calcular a soma dos dividendos
    const somaDividendos = dividendos.reduce((total, dividendo) => total + dividendo, 0);

    // Verificar se há dividendos válidos
    if (dividendos.length === 0 || somaDividendos === 0) {
        alert("Por favor, insira pelo menos um dividendo válido.");
        return;
    }

    // Calcular o yeld médio
    const yeldMedio = ((somaDividendos / dividendos.length) / cotacao) * 100;

    // Obter o percentual desejado
    const percentual = parseFloat(document.getElementById('percentual').value) / 100;

    if (isNaN(percentual) || percentual <= 0) {
        alert("Por favor, insira um percentual válido.");
        return;
    }

    // Calcular o preço teto
    const precoTeto = ((somaDividendos / dividendos.length) / percentual);

    // Exibir os resultados na modal
    document.getElementById('yeld-medio').innerText = yeldMedio.toFixed(2);
    document.getElementById('preco-teto').innerText = precoTeto.toFixed(2);

    // Abrir a modal de resultados
    const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    resultModal.show();
}
