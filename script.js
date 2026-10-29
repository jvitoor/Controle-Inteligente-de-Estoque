const STORAGE_KEY = 'controle_inteligente_estoque_v1';

let listaProdutos = [];
let idEmEdicao = null;
let timeoutFeedback = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoStorage();
    configurarEventos();
    atualizarInterfaceCompleta();
});

function configurarEventos() {
    const form = document.getElementById('product-form');
    const btnCancelar = document.getElementById('btn-cancelar-edicao');
    const btnExemplos = document.getElementById('btn-carregar-exemplos');
    const inputPesquisa = document.getElementById('input-pesquisa');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const filtroSituacao = document.getElementById('filtro-situacao');
    const ordenarPor = document.getElementById('ordenar-por');

    form.addEventListener('submit', manipularEnvioFormulario);
    btnCancelar.addEventListener('click', cancelarModoEdicao);
    btnExemplos.addEventListener('click', carregarProdutosDeExemplo);

    inputPesquisa.addEventListener('input', renderizarTabelaProdutos);
    filtroCategoria.addEventListener('change', renderizarTabelaProdutos);
    filtroSituacao.addEventListener('change', renderizarTabelaProdutos);
    ordenarPor.addEventListener('change', renderizarTabelaProdutos);
}

function carregarDadosDoStorage() {
    try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);
        if (!dadosSalvos) {
            listaProdutos = [];
            return;
        }

        const dadosConvertidos = JSON.parse(dadosSalvos);

        if (!Array.isArray(dadosConvertidos)) {
            throw new Error('Formato de dados inválido no armazenamento local.');
        }

        // Descarta registros corrompidos ou com tipos inválidos salvos no navegador
        listaProdutos = dadosConvertidos.filter(ehObjetoProdutoValido);
    } catch (erro) {
        console.error('Erro ao ler localStorage:', erro);
        listaProdutos = [];
        exibirMensagem('Dados salvos anteriormente estavam corrompidos e foram reiniciados.', 'erro');
    }
}

function salvarDadosNoStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listaProdutos));
    } catch (erro) {
        console.error('Erro ao salvar no localStorage:', erro);
        exibirMensagem('Não foi possível salvar as alterações no navegador.', 'erro');
    }
}

function ehObjetoProdutoValido(item) {
    return (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.nome === 'string' &&
        typeof item.categoria === 'string' &&
        typeof item.quantidade === 'number' && !isNaN(item.quantidade) &&
        typeof item.quantidadeMinima === 'number' && !isNaN(item.quantidadeMinima) &&
        typeof item.precoUnitario === 'number' && !isNaN(item.precoUnitario)
    );
}

// Regra de negócio principal: classifica o estoque comparando a quantidade atual com a mínima
function obterSituacaoEstoque(quantidade, quantidadeMinima) {
    if (quantidade === 0) {
        return {
            codigo: 'SEM_ESTOQUE',
            rotulo: 'Sem estoque',
            classeCss: 'badge-danger'
        };
    } else if (quantidade > 0 && quantidade <= quantidadeMinima) {
        return {
            codigo: 'CRITICO',
            rotulo: 'Estoque crítico',
            classeCss: 'badge-warning'
        };
    } else {
        return {
            codigo: 'NORMAL',
            rotulo: 'Estoque normal',
            classeCss: 'badge-success'
        };
    }
}

function calcularValorTotalProduto(quantidade, precoUnitario) {
    return quantidade * precoUnitario;
}

// Ignora o próprio ID durante a edição para permitir salvar o produto sem alterar seu nome
function existeProdutoComMesmoNome(nome, idIgnorado = null) {
    const nomeNormalizado = nome.trim().toLowerCase();
    const produtoEncontrado = listaProdutos.find((produto) => {
        const mesmoNome = produto.nome.trim().toLowerCase() === nomeNormalizado;
        const idDiferente = produto.id !== idIgnorado;
        return mesmoNome && idDiferente;
    });
    return Boolean(produtoEncontrado);
}

function validarDadosProduto(dados, idAtual = null) {
    if (!dados.nome || dados.nome.trim().length < 2) {
        return { valido: false, mensagem: 'Informe um nome válido para o produto (mínimo de 2 caracteres).' };
    }

    if (!dados.categoria) {
        return { valido: false, mensagem: 'Selecione uma categoria para o produto.' };
    }

    if (isNaN(dados.quantidade) || !Number.isInteger(dados.quantidade) || dados.quantidade < 0) {
        return { valido: false, mensagem: 'A quantidade em estoque deve ser um número inteiro maior ou igual a zero.' };
    }

    if (isNaN(dados.quantidadeMinima) || !Number.isInteger(dados.quantidadeMinima) || dados.quantidadeMinima < 1) {
        return { valido: false, mensagem: 'A quantidade mínima desejada deve ser um número inteiro de pelo menos 1.' };
    }

    if (isNaN(dados.precoUnitario) || dados.precoUnitario <= 0) {
        return { valido: false, mensagem: 'O preço unitário deve ser maior que zero (R$ 0,00 não é permitido).' };
    }

    if (existeProdutoComMesmoNome(dados.nome, idAtual)) {
        return { valido: false, mensagem: `Já existe um produto cadastrado com o nome "${dados.nome.trim()}".` };
    }

    return { valido: true, mensagem: '' };
}

function obterMaiorValorTotalEmEstoque() {
    if (listaProdutos.length === 0) return 0;

    return listaProdutos.reduce((maiorValor, produto) => {
        const valorProduto = calcularValorTotalProduto(produto.quantidade, produto.precoUnitario);
        return valorProduto > maiorValor ? valorProduto : maiorValor;
    }, 0);
}

function manipularEnvioFormulario(evento) {
    evento.preventDefault();

    const nomeInput = document.getElementById('produto-nome').value;
    const categoriaInput = document.getElementById('produto-categoria').value;
    const quantidadeInput = Number(document.getElementById('produto-quantidade').value);
    const minimoInput = Number(document.getElementById('produto-minimo').value);
    const precoInput = Number(document.getElementById('produto-preco').value);

    const dadosFormulario = {
        nome: nomeInput.trim(),
        categoria: categoriaInput,
        quantidade: quantidadeInput,
        quantidadeMinima: minimoInput,
        precoUnitario: precoInput
    };

    const resultadoValidacao = validarDadosProduto(dadosFormulario, idEmEdicao);
    if (!resultadoValidacao.valido) {
        exibirMensagem(resultadoValidacao.mensagem, 'erro');
        return;
    }

    if (idEmEdicao) {
        atualizarProdutoExistente(idEmEdicao, dadosFormulario);
    } else {
        cadastrarNovoProduto(dadosFormulario);
    }
}

function gerarIdentificadorUnico() {
    const sufixoAleatorio = Math.floor(1000 + Math.random() * 9000);
    return `PRD-${sufixoAleatorio}`;
}

function cadastrarNovoProduto(dados) {
    const novoProduto = {
        id: gerarIdentificadorUnico(),
        nome: dados.nome,
        categoria: dados.categoria,
        quantidade: dados.quantidade,
        quantidadeMinima: dados.quantidadeMinima,
        precoUnitario: dados.precoUnitario
    };

    listaProdutos.push(novoProduto);
    salvarDadosNoStorage();
    limparFormulario();
    atualizarInterfaceCompleta();
    exibirMensagem(`Produto "${novoProduto.nome}" cadastrado com sucesso!`, 'sucesso');
}

function iniciarEdicaoProduto(id) {
    const produto = listaProdutos.find((item) => item.id === id);

    if (!produto) {
        exibirMensagem('Erro: O produto selecionado para edição não foi encontrado.', 'erro');
        return;
    }

    idEmEdicao = produto.id;
    document.getElementById('produto-id').value = produto.id;
    document.getElementById('produto-nome').value = produto.nome;
    document.getElementById('produto-categoria').value = produto.categoria;
    document.getElementById('produto-quantidade').value = produto.quantidade;
    document.getElementById('produto-minimo').value = produto.quantidadeMinima;
    document.getElementById('produto-preco').value = produto.precoUnitario;

    document.getElementById('form-title').textContent = `Editando Produto (${produto.id})`;
    document.getElementById('btn-salvar').textContent = 'Atualizar Produto';
    document.getElementById('btn-cancelar-edicao').classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarProdutoExistente(id, novosDados) {
    const indice = listaProdutos.findIndex((item) => item.id === id);

    if (indice === -1) {
        exibirMensagem('Erro: Tentativa de editar um produto inexistente.', 'erro');
        cancelarModoEdicao();
        return;
    }

    listaProdutos = listaProdutos.map((produto) => {
        if (produto.id === id) {
            return {
                ...produto,
                nome: novosDados.nome,
                categoria: novosDados.categoria,
                quantidade: novosDados.quantidade,
                quantidadeMinima: novosDados.quantidadeMinima,
                precoUnitario: novosDados.precoUnitario
            };
        }
        return produto;
    });

    salvarDadosNoStorage();
    cancelarModoEdicao();
    atualizarInterfaceCompleta();
    exibirMensagem(`Produto "${novosDados.nome}" atualizado com sucesso!`, 'sucesso');
}

function excluirProduto(id) {
    const produtoAlvo = listaProdutos.find((item) => item.id === id);

    if (!produtoAlvo) {
        exibirMensagem('Erro: Tentativa de excluir um produto inexistente.', 'erro');
        return;
    }

    const confirmou = window.confirm(
        `Tem certeza que deseja excluir o produto "${produtoAlvo.nome}" (${produtoAlvo.id})?`
    );

    if (!confirmou) return;

    listaProdutos = listaProdutos.filter((item) => item.id !== id);

    if (idEmEdicao === id) {
        cancelarModoEdicao();
    }

    salvarDadosNoStorage();
    atualizarInterfaceCompleta();
    exibirMensagem(`Produto "${produtoAlvo.nome}" excluído com sucesso.`, 'sucesso');
}

function cancelarModoEdicao() {
    idEmEdicao = null;
    limparFormulario();
    document.getElementById('form-title').textContent = 'Cadastrar Novo Produto';
    document.getElementById('btn-salvar').textContent = 'Salvar Produto';
    document.getElementById('btn-cancelar-edicao').classList.add('hidden');
}

function limparFormulario() {
    document.getElementById('product-form').reset();
    document.getElementById('produto-id').value = '';
}

function atualizarIndicadores() {
    const totalProdutos = listaProdutos.length;

    const qtdSemEstoque = listaProdutos.filter(
        (p) => obterSituacaoEstoque(p.quantidade, p.quantidadeMinima).codigo === 'SEM_ESTOQUE'
    ).length;

    const qtdEstoqueCritico = listaProdutos.filter(
        (p) => obterSituacaoEstoque(p.quantidade, p.quantidadeMinima).codigo === 'CRITICO'
    ).length;

    const valorTotalEstoque = listaProdutos.reduce((acumulador, produto) => {
        return acumulador + calcularValorTotalProduto(produto.quantidade, produto.precoUnitario);
    }, 0);

    document.getElementById('ind-total-produtos').textContent = totalProdutos;
    document.getElementById('ind-sem-estoque').textContent = qtdSemEstoque;
    document.getElementById('ind-estoque-critico').textContent = qtdEstoqueCritico;
    document.getElementById('ind-valor-total').textContent = formatarMoeda(valorTotalEstoque);
}

function renderizarTopCincoMenorEstoque() {
    const containerLista = document.getElementById('priority-list');
    containerLista.innerHTML = '';

    if (listaProdutos.length === 0) {
        containerLista.innerHTML = '<li class="priority-item">Nenhum produto cadastrado.</li>';
        return;
    }

    // Usa cópia rasa do array para ordenar os 5 menores sem alterar a ordem da lista principal
    const cincoMenores = [...listaProdutos]
        .sort((a, b) => a.quantidade - b.quantidade)
        .slice(0, 5);

    cincoMenores.forEach((produto) => {
        const situacao = obterSituacaoEstoque(produto.quantidade, produto.quantidadeMinima);
        const li = document.createElement('li');
        li.className = 'priority-item';
        li.innerHTML = `
            <div class="priority-item-info">
                <strong>${escaparHtml(produto.nome)}</strong>
                <span>Mínimo ideal: ${produto.quantidadeMinima} un.</span>
            </div>
            <span class="badge ${situacao.classeCss}">${produto.quantidade} un.</span>
        `;
        containerLista.appendChild(li);
    });
}

function obterProdutosFiltradosEOrdenados() {
    const termoPesquisa = document.getElementById('input-pesquisa').value.trim().toLowerCase();
    const categoriaSelecionada = document.getElementById('filtro-categoria').value;
    const situacaoSelecionada = document.getElementById('filtro-situacao').value;
    const criterioOrdenacao = document.getElementById('ordenar-por').value;

    const filtrados = listaProdutos.filter((produto) => {
        const atendeNome = produto.nome.toLowerCase().includes(termoPesquisa);
        const atendeCategoria =
            categoriaSelecionada === 'TODAS' || produto.categoria === categoriaSelecionada;

        const situacaoAtual = obterSituacaoEstoque(produto.quantidade, produto.quantidadeMinima).codigo;
        const atendeSituacao =
            situacaoSelecionada === 'TODAS' || situacaoAtual === situacaoSelecionada;

        return atendeNome && atendeCategoria && atendeSituacao;
    });

    return filtrados.sort((a, b) => {
        switch (criterioOrdenacao) {
            case 'NOME_ASC':
                return a.nome.localeCompare(b.nome, 'pt-BR');
            case 'NOME_DESC':
                return b.nome.localeCompare(a.nome, 'pt-BR');
            case 'QTD_ASC':
                return a.quantidade - b.quantidade;
            case 'QTD_DESC':
                return b.quantidade - a.quantidade;
            case 'PRECO_ASC':
                return a.precoUnitario - b.precoUnitario;
            case 'PRECO_DESC':
                return b.precoUnitario - a.precoUnitario;
            default:
                return 0;
        }
    });
}

function renderizarTabelaProdutos() {
    const tbody = document.getElementById('products-tbody');
    const emptyState = document.getElementById('empty-state');
    const emptyStateText = document.getElementById('empty-state-text');
    const tabela = document.getElementById('products-table');

    tbody.innerHTML = '';

    const produtosExibidos = obterProdutosFiltradosEOrdenados();
    const maiorValorEstoque = obterMaiorValorTotalEmEstoque();

    if (listaProdutos.length === 0) {
        tabela.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyStateText.textContent =
            'O estoque está vazio. Utilize o formulário acima ou clique em "Carregar Dados de Exemplo" para começar.';
        return;
    }

    if (produtosExibidos.length === 0) {
        tabela.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyStateText.textContent =
            'Nenhum produto encontrado para a pesquisa ou filtros selecionados.';
        return;
    }

    tabela.classList.remove('hidden');
    emptyState.classList.add('hidden');

    produtosExibidos.forEach((produto) => {
        const situacao = obterSituacaoEstoque(produto.quantidade, produto.quantidadeMinima);
        const valorTotalItem = calcularValorTotalProduto(produto.quantidade, produto.precoUnitario);
        const ehMaiorValor = maiorValorEstoque > 0 && valorTotalItem === maiorValorEstoque;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${escaparHtml(produto.id)}</code></td>
            <td>
                <strong>${escaparHtml(produto.nome)}</strong>
                ${ehMaiorValor ? '<span class="badge-top-value" title="Produto com maior valor financeiro em estoque">★ Maior Valor</span>' : ''}
            </td>
            <td>${escaparHtml(produto.categoria)}</td>
            <td><strong>${produto.quantidade}</strong> / ${produto.quantidadeMinima} un.</td>
            <td>${formatarMoeda(produto.precoUnitario)}</td>
            <td><strong>${formatarMoeda(valorTotalItem)}</strong></td>
            <td><span class="badge ${situacao.classeCss}">${situacao.rotulo}</span></td>
            <td class="actions-cell">
                <button type="button" class="btn btn-sm btn-edit" data-acao="editar" data-id="${produto.id}">Editar</button>
                <button type="button" class="btn btn-sm btn-delete" data-acao="excluir" data-id="${produto.id}">Excluir</button>
            </td>
        `;

        const btnEditar = tr.querySelector('[data-acao="editar"]');
        const btnExcluir = tr.querySelector('[data-acao="excluir"]');

        btnEditar.addEventListener('click', () => iniciarEdicaoProduto(produto.id));
        btnExcluir.addEventListener('click', () => excluirProduto(produto.id));

        tbody.appendChild(tr);
    });
}

function atualizarInterfaceCompleta() {
    atualizarIndicadores();
    renderizarTopCincoMenorEstoque();
    renderizarTabelaProdutos();
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function exibirMensagem(texto, tipo = 'sucesso') {
    const container = document.getElementById('feedback-container');
    container.textContent = texto;
    container.className = `feedback-message ${
        tipo === 'erro' ? 'feedback-error' : 'feedback-success'
    }`;

    if (timeoutFeedback) {
        clearTimeout(timeoutFeedback);
    }

    timeoutFeedback = setTimeout(() => {
        container.classList.add('hidden');
    }, 4500);
}

// Diminui as strings antes de injetar no DOM para evitar quebra de HTML
function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function carregarProdutosDeExemplo() {
    if (listaProdutos.length > 0) {
        const confirmar = window.confirm(
            'Isso substituirá a lista atual por produtos de demonstração. Deseja continuar?'
        );
        if (!confirmar) return;
    }

    listaProdutos = [
        {
            id: 'PRD-1001',
            nome: 'Notebook Dell Inspiron 15',
            categoria: 'Informática',
            quantidade: 8,
            quantidadeMinima: 5,
            precoUnitario: 3850.00
        },
        {
            id: 'PRD-1002',
            nome: 'Mouse Sem Fio Logitech M170',
            categoria: 'Periféricos',
            quantidade: 3,
            quantidadeMinima: 10,
            precoUnitario: 69.90
        },
        {
            id: 'PRD-1003',
            nome: 'Teclado Mecânico Redragon Kumara',
            categoria: 'Periféricos',
            quantidade: 0,
            quantidadeMinima: 6,
            precoUnitario: 229.90
        },
        {
            id: 'PRD-1004',
            nome: 'Monitor LG UltraWide 29"',
            categoria: 'Eletrônicos',
            quantidade: 4,
            quantidadeMinima: 4,
            precoUnitario: 1299.00
        },
        {
            id: 'PRD-1005',
            nome: 'Cadeira Ergonômica Escritório',
            categoria: 'Móveis',
            quantidade: 12,
            quantidadeMinima: 4,
            precoUnitario: 890.00
        },
        {
            id: 'PRD-1006',
            nome: 'Cartucho Toner HP 105A',
            categoria: 'Suprimentos',
            quantidade: 0,
            quantidadeMinima: 8,
            precoUnitario: 145.50
        }
    ];

    salvarDadosNoStorage();
    cancelarModoEdicao();
    atualizarInterfaceCompleta();
    exibirMensagem('Produtos de exemplo carregados para demonstração!', 'sucesso');
}
