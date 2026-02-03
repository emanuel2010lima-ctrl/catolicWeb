$(document).ready(function() {
    $('#mobile_btn').on('click', function () {
        $('#mobile_menu').toggleClass('active');
        $('#mobile_btn').find('i').toggleClass('fa-x');
    });
}); 

document.querySelectorAll('.dropdown-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const li = this.closest('li');
        const submenu = li.querySelector('ul');
        const icon = this.querySelector('i');

        const isOpen = submenu.style.display === 'block';

        // fecha todos
        document.querySelectorAll('#mobile_menu li ul').forEach(ul => {
            ul.style.display = 'none';
        });

        document.querySelectorAll('.dropdown-btn i').forEach(i => {
            i.classList.remove('fa-caret-up');
            i.classList.add('fa-caret-down');
        });

        // abre o clicado
        if (!isOpen) {
            submenu.style.display = 'block';
            icon.classList.remove('fa-caret-down');
            icon.classList.add('fa-caret-up');
        }
    });
});