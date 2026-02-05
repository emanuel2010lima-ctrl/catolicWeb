// Seleciona a DIV que contém o link e o botão
document.querySelectorAll('#mobile_menu .nav-link').forEach(container => {
    container.addEventListener('click', function (e) {
        // Se houver um submenu abaixo desta div
        const submenu = this.nextElementSibling; 
        if (submenu && submenu.classList.contains('dropdown-menu')) {
            e.preventDefault(); // Impede o link de navegar
            
            const isOpen = submenu.style.display === 'block';
            submenu.style.display = isOpen ? 'none' : 'block';
            
            // Gira a setinha
            const icon = this.querySelector('.dropdown-btn i');
            if(icon) {
                icon.classList.toggle('fa-caret-up');
                icon.classList.toggle('fa-caret-down');
            }
        }
    });
});
// Seleciona os elementos da página
const searchInput = document.getElementById('search');
const itemsList = document.querySelector('.itens');

// Função para remover acentos e deixar texto minúsculo (facilita a busca)
function formatString(value) {
    if (!value) return "";
    return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Verifica se os elementos existem antes de rodar o código
if (searchInput && itemsList) {
    
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        const value = formatString(searchTerm);
        
        itemsList.innerHTML = ""; // Limpa os resultados anteriores
        
        // Se o campo estiver vazio, esconde a caixa de resultados
        if (value.length === 0) {
            itemsList.style.display = 'none';
            return;
        }

        let hasResults = false;

        // Verifica se a variável 'dadosSite' existe
        if (typeof dadosSite !== 'undefined') {
            dadosSite.forEach(dado => {
                const titulo = formatString(dado.titulo);
                const descricao = formatString(dado.descricao);
                const texto = formatString(dado.textoCompleto || "");

                // Se o termo digitado estiver no título, descrição ou texto completo
                if (titulo.includes(value) || descricao.includes(value) || texto.includes(value)) {
                    itemsList.style.display = 'block';
                    hasResults = true;

                    // Cria o HTML do item (Note a correção para item-description)
                    const itemHTML = `
                        <a href="${dado.link}" class="item" style="text-decoration: none;">
                            <div class="item-image"><img src="${dado.imagem}"></div>
                            <div class="item-content">
                                <p class="item-title">${dado.titulo}</p>
                                <p class="item-description">${dado.descricao}</p>
                            </div>
                        </a>
                    `;
                    itemsList.innerHTML += itemHTML;
                }
            });
        }

        // Se nada for encontrado
        if (!hasResults) {
            itemsList.style.display = 'block';
            itemsList.innerHTML = '<p class="no_results" style="display:block;">Nenhum resultado encontrado...</p>';
        }
    });
}