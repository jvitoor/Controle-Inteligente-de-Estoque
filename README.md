# Controle-Inteligente-de-Estoque

# 📦 Módulo: Controle Inteligente de Estoque

Aplicação web desenvolvida como Trabalho Individual da disciplina de JavaScript (Prof. Cleidson Daniel). O módulo realiza o gerenciamento de produtos em estoque, classificação automática de criticidade, cálculo de indicadores patrimoniais e persistência local.

## 🚀 Funcionalidades Implementadas

- **Gerenciamento Completo (CRUD):** Cadastro, listagem em tabela, edição e exclusão com confirmação de segurança.
- **Classificação Automática de Estoque:**
  - 🔴 **Sem estoque:** Quantidade igual a `0`.
  - 🟡 **Estoque crítico:** Quantidade maior que `0` e menor ou igual à quantidade mínima definida.
  - 🟢 **Estoque normal:** Quantidade superior à quantidade mínima.
- **Regras de Negócio Adicionais:**
  1. Bloqueio de quantidades negativas ou não inteiras.
  2. Bloqueio de preço unitário igual ou inferior a zero.
  3. Verificação e bloqueio de produtos com nomes duplicados.
  4. Cálculo automático do valor total estocado por item (`quantidade * preço unitário`).
  5. Destaque visual automático (`★ Maior Valor`) para o produto com maior capital imobilizado no estoque.
- **Indicadores em Tempo Real:** Total de itens cadastrados, contagem de produtos sem estoque, contagem em estado crítico, soma financeira total do estoque e lista **Top 5 produtos com menor quantidade disponível**.
- **Pesquisa, Filtros e Ordenação:** Busca por nome em tempo real, filtros combinados por categoria e situação de estoque, e ordenação por nome, quantidade ou preço unitário.
- **Persistência de Dados:** Armazenamento automático via `localStorage` com validação contra dados corrompidos.

## 🛠️ Tecnologias Utilizadas

- **HTML5** (Estruturação semântica e acessível)
- **CSS3** (Layout responsivo com CSS Grid, Flexbox e variáveis nativas)
- **JavaScript (ES6+)** (Manipulação do DOM, eventos, `localStorage` e métodos de array `map`, `filter`, `find`, `reduce` e `forEach`)



