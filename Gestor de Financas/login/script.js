document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('btn-login');

    if (!loginForm || !submitBtn || !emailInput || !passwordInput) return;

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        if (email === 'admin@gmail.com' && password === 'password') {
            window.location.href = '../index.html';
        } else {
            alert('Usuário ou senha inválidos.');
        }
    });
});
