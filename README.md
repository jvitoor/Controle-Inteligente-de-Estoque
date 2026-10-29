# 📦 Módulo: Controle Inteligente de Estoque

> **🔗 Link do Repositório GitHub:** https://github.com/jvitoor/Controle-Inteligente-de-Estoque.git  
> **👨‍🏫 Professor:** Cleidson Daniel  
> **📚 Disciplina:** Desenvolvimento em JavaScript
> **📚 Aluno: João Vitor Guerra Rodrigues
> **📚 Curso: Ciência da Computação - 6° Período

---

## 📋 Sobre o Projeto

Este projeto consiste em um **Módulo de Controle Inteligente de Estoque** desenvolvido com HTML5, CSS3 e JavaScript puro (Vanilla JS). O objetivo da aplicação é gerenciar o catálogo de produtos de uma empresa, monitorar automaticamente níveis críticos de armazenamento, calcular indicadores financeiros em tempo real e garantir a persistência dos dados no navegador utilizando `localStorage`.

---

## ✨ Funcionalidades e Regras de Negócio

### 1. Gerenciamento de Produtos (CRUD)
- **Cadastro:** Inclusão de produtos com ID único gerado automaticamente (`PRD-XXXX`), nome, categoria, quantidade atual, quantidade mínima desejada e preço unitário.
- **Listagem Dinâmica:** Exibição organizada em tabela responsiva com cálculo de subtotal por produto.
- **Edição:** Carregamento dos dados do produto de volta ao formulário para atualização rápida.
- **Exclusão Segura:** Remoção de itens mediante confirmação prévia do usuário (`window.confirm`).

### 2. Classificação Automática de Situação do Estoque
- 🔴 **Sem estoque:** Quantidade igual a `0`.
- 🟡 **Estoque crítico:** Quantidade maior que `0` e menor ou igual à quantidade mínima definida.
- 🟢 **Estoque normal:** Quantidade superior à quantidade mínima desejada.

### 3. Regras de Negócio Adicionais Implementadas
1. **Validação de Quantidades:** Impede o cadastro de quantidades negativas, vazias ou decimais.
2. **Validação de Preço:** Impede o cadastro de produtos com preço unitário igual ou inferior a `R$ 0,00`.
3. **Prevenção de Duplicidade:** Verifica se já existe um produto com o mesmo nome (ignorando maiúsculas/minúsculas) antes de salvar.
4. **Cálculo de Valor Armazenado por Produto:** Multiplica a quantidade em estoque pelo preço unitário em tempo real.
5. **Destaque de Maior Valor em Estoque:** Identifica e aplica o selo `★ Maior Valor` ao produto que representa o maior capital armazenado.

### 4. Indicadores, Filtros e Ordenação
- **Painel de Indicadores:** Total de produtos cadastrados, total sem estoque, total em estado crítico e valor financeiro total estimado do estoque.
- **Top 5 Menor Estoque:** Painel lateral que destaca os 5 produtos prioritários com menor número de unidades disponíveis.
- **Busca e Filtros Combinados:** Pesquisa instantânea por nome, filtro por categoria e filtro por situação do estoque.
- **Ordenação Múltipla:** Ordenação alfabética (`A-Z` / `Z-A`), por quantidade (`Menor/Maior`) e por preço unitário (`Menor/Maior`).

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estruturação semântica de formulários, tabelas e seções de indicadores.
- **CSS3:** Estilização moderna com variáveis CSS (`:root`), layout em *CSS Grid* e *Flexbox*, e responsividade para dispositivos móveis (`@media`).
- **JavaScript (ES6+):** Manipulação do DOM, tratamento de eventos, funções modulares, tratamento de erros (`try/catch`), persistência com `localStorage` e uso de métodos de array (`map`, `filter`, `find`, `findIndex`, `reduce`, `sort`, `slice` e `forEach`).

---

## 📂 Estrutura de Arquivos

```text
controle-estoque-js/
├── index.html        # Estrutura principal da interface, formulário, filtros e tabela
├── style.css         # Estilos visuais, badges de situação e regras de responsividade
├── script.js         # Lógica de negócio, validações, indicadores e localStorage
├── README.md         # Documentação completa e instruções de execução
└── link-github.txt   # Link direto para o repositório GitHub (para entrega compactada)
