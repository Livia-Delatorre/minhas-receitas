//here
// Inicialização
    let receitas = JSON.parse(localStorage.getItem('receitas')) || [];

    // Elementos DOM
    const receitasContainer = document.getElementById('receitasContainer');
    const modalReceita = document.getElementById('modalReceita');
    const modalDetalhes = document.getElementById('modalDetalhes');
    const btnNovaReceita = document.getElementById('btnNovaReceita');
    const formReceita = document.getElementById('formReceita');
    const buscaInput = document.getElementById('busca');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroStatus = document.getElementById('filtroStatus');

    // Event Listeners
    btnNovaReceita.onclick = () => modalReceita.style.display = 'block';
    
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            modalReceita.style.display = 'none';
            modalDetalhes.style.display = 'none';
        }
    });

    window.onclick = (event) => {
        if (event.target == modalReceita) modalReceita.style.display = 'none';
        if (event.target == modalDetalhes) modalDetalhes.style.display = 'none';
    }

    buscaInput.addEventListener('input', renderizarReceitas);
    filtroCategoria.addEventListener('change', renderizarReceitas);
    filtroStatus.addEventListener('change', renderizarReceitas);

    formReceita.onsubmit = (e) => {
        e.preventDefault();
        salvarReceita();
    };

    // Tornar funções globais para serem acessadas pelos botões
    window.adicionarIngrediente = function() {
        const lista = document.getElementById('ingredientesLista');
        const div = document.createElement('div');
        div.className = 'ingrediente-item';
        div.innerHTML = `
            <input type="text" placeholder="Ex: 2 xícaras de farinha" required>
            <button type="button" class="btn-remover" onclick="removerIngrediente(this)">×</button>
        `;
        lista.appendChild(div);
    }

    window.removerIngrediente = function(botao) {
        botao.parentElement.remove();
    }

    function salvarReceita() {
        const ingredientes = [];
        document.querySelectorAll('#ingredientesLista input').forEach(input => {
            if (input.value.trim() !== '') {
                ingredientes.push({
                    texto: input.value,
                    marcado: false
                });
            }
        });

        // Verificar se tem pelo menos um ingrediente
        if (ingredientes.length === 0) {
            alert('Adicione pelo menos um ingrediente!');
            return;
        }

        const novaReceita = {
            id: Date.now(),
            titulo: document.getElementById('titulo').value,
            categoria: document.getElementById('categoria').value,
            ingredientes: ingredientes,
            modoPreparo: document.getElementById('modoPreparo').value,
            status: 'nao-feito',
            avaliacao: 0,
            dataCriacao: new Date().toISOString()
        };

        receitas.push(novaReceita);
        localStorage.setItem('receitas', JSON.stringify(receitas));
        
        modalReceita.style.display = 'none';
        formReceita.reset();
        
        // Reset da lista de ingredientes
        document.getElementById('ingredientesLista').innerHTML = `
            <div class="ingrediente-item">
                <input type="text" placeholder="Ex: 2 xícaras de farinha" required>
                <button type="button" class="btn-remover" onclick="removerIngrediente(this)">×</button>
            </div>
        `;
        
        renderizarReceitas();
    }

    function renderizarReceitas() {
        const busca = buscaInput.value.toLowerCase();
        const categoria = filtroCategoria.value;
        const status = filtroStatus.value;

        let receitasFiltradas = receitas.filter(receita => {
            const matchBusca = receita.titulo.toLowerCase().includes(busca);
            const matchCategoria = categoria === 'todas' || receita.categoria === categoria;
            const matchStatus = status === 'todas' || 
                               (status === 'feito' && receita.status === 'feito') ||
                               (status === 'nao-feito' && receita.status === 'nao-feito');
            
            return matchBusca && matchCategoria && matchStatus;
        });

        if (receitasFiltradas.length === 0) {
            receitasContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Nenhuma receita encontrada. Clique em "Nova Receita" para começar!</p>';
            return;
        }

        receitasContainer.innerHTML = receitasFiltradas.map(receita => `
            <div class="card-receita" onclick="abrirDetalhes(${receita.id})">
                <h3>${receita.titulo}</h3>
                <span class="categoria">${getCategoriaLabel(receita.categoria)}</span>
                
                <div class="avaliacao" onclick="event.stopPropagation()">
                    ${gerarEstrelas(receita.id, receita.avaliacao)}
                </div>
                
                <div class="status">
                    <span class="${receita.status}">
                        ${receita.status === 'feito' ? '✓ Feita' : '✗ Não feita'}
                    </span>
                    <div class="btn-checkbox ${receita.status}" 
                         onclick="event.stopPropagation(); window.toggleStatus(${receita.id})">
                        ${receita.status === 'feito' ? '✓' : '✗'}
                    </div>
                </div>
                
                <div style="font-size: 0.9em; color: #666;">
                    ${receita.ingredientes.length} ingredientes
                </div>
            </div>
        `).join('');
    }

    function getCategoriaLabel(categoria) {
        const labels = {
            'cafe': '☕ Café da manhã',
            'almoco': '🍛 Almoço',
            'jantar': '🍽️ Jantar',
            'sobremesa': '🍰 Sobremesa'
        };
        return labels[categoria] || categoria;
    }

    function gerarEstrelas(receitaId, avaliacao) {
        let estrelas = '';
        for (let i = 1; i <= 5; i++) {
            estrelas += `<span class="star ${i <= avaliacao ? 'active' : ''}" 
                               onclick="event.stopPropagation(); window.avaliarReceita(${receitaId}, ${i})">★</span>`;
        }
        return estrelas;
    }

    window.avaliarReceita = function(id, nota) {
        const receita = receitas.find(r => r.id === id);
        if (receita) {
            receita.avaliacao = nota;
            localStorage.setItem('receitas', JSON.stringify(receitas));
            renderizarReceitas();
        }
    }

    window.toggleStatus = function(id) {
        const receita = receitas.find(r => r.id === id);
        if (receita) {
            receita.status = receita.status === 'feito' ? 'nao-feito' : 'feito';
            localStorage.setItem('receitas', JSON.stringify(receitas));
            renderizarReceitas();
            
            if (modalDetalhes.style.display === 'block') {
                abrirDetalhes(id);
            }
        }
    }

    window.abrirDetalhes = function(id) {
        const receita = receitas.find(r => r.id === id);
        if (!receita) return;

        const detalhesDiv = document.getElementById('detalhesReceita');
        
        detalhesDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">${receita.titulo}</h2>
                <span class="categoria">${getCategoriaLabel(receita.categoria)}</span>
            </div>
            
            <div class="avaliacao" style="justify-content: center; margin: 20px 0;">
                ${gerarEstrelas(receita.id, receita.avaliacao)}
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    Status:
                    <div class="btn-checkbox ${receita.status}" 
                         onclick="window.toggleStatus(${receita.id})" 
                         style="display: inline-flex;">
                        ${receita.status === 'feito' ? '✓' : '✗'}
                    </div>
                </h3>
                <span class="${receita.status}" style="font-size: 1.1em;">
                    ${receita.status === 'feito' ? '✓ Receita já foi feita' : '✗ Receita ainda não foi feita'}
                </span>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>📝 Ingredientes:</h3>
                ${receita.ingredientes.map((ing, index) => `
                    <div class="ingrediente-checkbox" style="margin: 10px 0;">
                        <input type="checkbox" 
                               ${ing.marcado ? 'checked' : ''} 
                               onchange="window.marcarIngrediente(${receita.id}, ${index}, this.checked)"
                               id="ing_${index}">
                        <label for="ing_${index}" class="${ing.marcado ? 'ingrediente-marcado' : ''}" 
                               style="cursor: pointer;">
                            ${ing.texto}
                        </label>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin: 20px 0;">
                <h3>👩‍🍳 Modo de Preparo:</h3>
                <p style="white-space: pre-line; background: #f9f9f9; padding: 15px; border-radius: 8px;">
                    ${receita.modoPreparo}
                </p>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button class="btn-primary" onclick="window.editarReceita(${receita.id})" style="flex: 1;">
                    ✏️ Editar Receita
                </button>
                <button class="btn-remover" onclick="window.excluirReceita(${receita.id})" style="flex: 1;">
                    🗑️ Excluir
                </button>
            </div>
        `;
        
        modalDetalhes.style.display = 'block';
    }

    window.marcarIngrediente = function(receitaId, index, marcado) {
        const receita = receitas.find(r => r.id === receitaId);
        if (receita && receita.ingredientes[index]) {
            receita.ingredientes[index].marcado = marcado;
            localStorage.setItem('receitas', JSON.stringify(receitas));
            abrirDetalhes(receitaId);
        }
    }

    window.editarReceita = function(id) {
        const receita = receitas.find(r => r.id === id);
        if (!receita) return;
        
        // Fechar modal de detalhes
        modalDetalhes.style.display = 'none';
        
        // Preencher o formulário com os dados da receita
        document.getElementById('titulo').value = receita.titulo;
        document.getElementById('categoria').value = receita.categoria;
        document.getElementById('modoPreparo').value = receita.modoPreparo;
        
        // Limpar e recriar a lista de ingredientes
        const lista = document.getElementById('ingredientesLista');
        lista.innerHTML = '';
        
        receita.ingredientes.forEach(ing => {
            const div = document.createElement('div');
            div.className = 'ingrediente-item';
            div.innerHTML = `
                <input type="text" value="${ing.texto}" required>
                <button type="button" class="btn-remover" onclick="removerIngrediente(this)">×</button>
            `;
            lista.appendChild(div);
        });
        
        // Remover a receita antiga (será substituída pela versão editada)
        receitas = receitas.filter(r => r.id !== id);
        
        // Abrir o modal de edição
        modalReceita.style.display = 'block';
        
        // Mudar o texto do botão de salvar
        const salvarBtn = document.querySelector('#formReceita .btn-primary');
        salvarBtn.textContent = 'Atualizar Receita';
        
        // Remover o event listener anterior e adicionar um temporário
        formReceita.onsubmit = function(e) {
            e.preventDefault();
            atualizarReceita(id);
        };
    }

    function atualizarReceita(idAntigo) {
        const ingredientes = [];
        document.querySelectorAll('#ingredientesLista input').forEach(input => {
            if (input.value.trim() !== '') {
                ingredientes.push({
                    texto: input.value,
                    marcado: false
                });
            }
        });

        if (ingredientes.length === 0) {
            alert('Adicione pelo menos um ingrediente!');
            return;
        }

        const receitaAtualizada = {
            id: idAntigo, // Manter o mesmo ID
            titulo: document.getElementById('titulo').value,
            categoria: document.getElementById('categoria').value,
            ingredientes: ingredientes,
            modoPreparo: document.getElementById('modoPreparo').value,
            status: 'nao-feito',
            avaliacao: 0,
            dataCriacao: new Date().toISOString()
        };

        receitas.push(receitaAtualizada);
        localStorage.setItem('receitas', JSON.stringify(receitas));
        
        // Resetar o formulário
        modalReceita.style.display = 'none';
        formReceita.reset();
        document.getElementById('ingredientesLista').innerHTML = `
            <div class="ingrediente-item">
                <input type="text" placeholder="Ex: 2 xícaras de farinha" required>
                <button type="button" class="btn-remover" onclick="removerIngrediente(this)">×</button>
            </div>
        `;
        
        // Restaurar o texto do botão
        const salvarBtn = document.querySelector('#formReceita .btn-primary');
        salvarBtn.textContent = 'Salvar Receita';
        
        // Restaurar o event listener original
        formReceita.onsubmit = (e) => {
            e.preventDefault();
            salvarReceita();
        };
        
        renderizarReceitas();
    }

    window.deletarReceita = function(id) {
    if(confirm('Deseja realmente excluir esta receita?')) {
        receitas = receitas.filter(r => r.id !== id);
        localStorage.setItem('receitas', JSON.stringify(receitas));
        modalDetalhes.style.display = 'none';
        renderizarReceitas();
    }
}

    // Renderizar receitas ao carregar a página
    renderizarReceitas();

