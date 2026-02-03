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