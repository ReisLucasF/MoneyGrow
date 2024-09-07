function calcular() {
    // Capturar os valores do formulário
    const precoCota = parseFloat(document.getElementById('preco-cota').value);
    const ultimoRendimento = parseFloat(document.getElementById('ultimo-rendimento').value);
    const investimentoMensal = parseFloat(document.getElementById('investimento-mensal').value);
    const prazo = parseInt(document.getElementById('prazo').value);
    const qtdCotasInicial = parseInt(document.getElementById('qtd-cotas-inicial').value);
    const reinvestir = document.getElementById('reinvestir-dividendos').checked;

    let totalInvestido = 0;
    let totalReinvestido = 0;
    let cotas = qtdCotasInicial;
    let dividendosAnteriores = 0;
    const accordionResultados = document.getElementById('accordionResultados');
    accordionResultados.innerHTML = '';

    // Exibir o container de resultados
    const resultadosContainer = document.getElementById('resultados-container');
    resultadosContainer.style.display = 'block';

    // Para cada ano
    for (let ano = 1; ano <= prazo; ano++) {
        let tabela = '';
        let totalAnoInvestido = 0, totalAnoReinvestido = 0, dividendosAno = 0;

        // Para cada mês
        for (let mes = 1; mes <= 12; mes++) {
            // O reinvestimento deve ser o dividendo do mês anterior
            let reinvestimento = reinvestir ? dividendosAnteriores : 0;
            const cotasReinvestidas = Math.floor(reinvestimento / precoCota); // Arredondando para o inteiro mais baixo

            // Aporte mensal
            const cotasAporte = Math.floor(investimentoMensal / precoCota); // Arredondando para o inteiro mais baixo

            // Atualizar a quantidade de cotas
            cotas += cotasReinvestidas + cotasAporte;

            // Cálculo dos dividendos do mês atual
            const dividendos = cotas * ultimoRendimento;

            // Atualizar os totais
            totalReinvestido += reinvestimento;
            totalInvestido += investimentoMensal;

            totalAnoInvestido += investimentoMensal;
            totalAnoReinvestido += reinvestimento;
            dividendosAno += dividendos;

            // Cálculo do patrimônio (cotas * valor da cota + investimento mensal + reinvestimento)
            const patrimonio = cotas * precoCota;

            // Linha da tabela para o mês
            tabela += `
                <tr>
                    <td>${mes}°</td>
                    <td>${cotas}</td> <!-- Exibe o valor inteiro de cotas -->
                    <td>${formatarMoeda(investimentoMensal)}</td>
                    <td>${formatarMoeda(patrimonio)}</td> <!-- Exibe o valor do patrimônio -->
                    <td>${formatarMoeda(reinvestimento)}</td>
                    <td>${formatarMoeda(dividendos)}</td>
                </tr>
            `;

            // O dividendo do mês atual será usado para reinvestimento no próximo mês
            dividendosAnteriores = dividendos;
        }

        // Adicionar ano ao acordeão
        accordionResultados.innerHTML += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${ano}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${ano}" aria-expanded="false" aria-controls="collapse${ano}">
                        Ano ${ano}
                    </button>
                </h2>
                <div id="collapse${ano}" class="accordion-collapse collapse" aria-labelledby="heading${ano}" data-bs-parent="#accordionResultados">
                    <div class="accordion-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Cotas</th>
                                    <th>Valor Investido</th>
                                    <th>Patrimônio</th>
                                    <th>Reinvestimento</th>
                                    <th>Dividendo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tabela}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Atualizar os resultados finais
    document.getElementById('ultimo-rendimento-resumo').innerText = ultimoRendimento.toFixed(2);
    document.getElementById('total-investido').innerText = totalInvestido.toFixed(2);
    document.getElementById('total-reinvestido').innerText = totalReinvestido.toFixed(2);
    document.getElementById('dividendos-finais').innerText = (cotas * ultimoRendimento).toFixed(2);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
