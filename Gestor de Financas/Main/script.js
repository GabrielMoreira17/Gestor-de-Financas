document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".section");
    const addExpenseBtn = document.getElementById("add-expense-btn");
    const expenseModal = document.getElementById("expense-modal");
    const closeExpenseModal = document.getElementById("close-expense-modal");
    const cancelExpenseBtn = document.getElementById("cancel-expense");
    const expenseForm = document.getElementById("expense-form");
    const expensesList = document.getElementById("expenses-list");
    const addGoalBtn = document.getElementById("add-goal-btn");
    const goalModal = document.getElementById("goal-modal");
    const closeGoalModal = document.getElementById("close-goal-modal");
    const cancelGoalBtn = document.getElementById("cancel-goal");
    const goalForm = document.getElementById("goal-form");
    const goalsGrid = document.getElementById("goals-grid");
    const getAiSuggestionBtn = document.getElementById("get-ai-suggestion");
    const aiSuggestionText = document.getElementById("ai-suggestion");
    const notificationToast = document.getElementById("notification-toast");
    const toastMessage = notificationToast.querySelector(".toast-message");
    const toastIcon = notificationToast.querySelector(".toast-icon");

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let goals = JSON.parse(localStorage.getItem("goals")) || [];

    // Função para exibir notificações
    function showNotification(message, type = "info") {
        toastMessage.textContent = message;
        toastIcon.className = "toast-icon"; // Reset icon classes
        if (type === "success") {
            toastIcon.classList.add("fas", "fa-check-circle");
            notificationToast.style.backgroundColor = "var(--success-color)";
        } else if (type === "warning") {
            toastIcon.classList.add("fas", "fa-exclamation-triangle");
            notificationToast.style.backgroundColor = "var(--warning-color)";
        } else if (type === "error") {
            toastIcon.classList.add("fas", "fa-times-circle");
            notificationToast.style.backgroundColor = "var(--danger-color)";
        } else {
            toastIcon.classList.add("fas", "fa-info-circle");
            notificationToast.style.backgroundColor = "var(--secondary-color)";
        }
        notificationToast.classList.add("show");
        setTimeout(() => {
            notificationToast.classList.remove("show");
        }, 3000);
    }

    // Navegação entre seções
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove("active"));
            link.classList.add("active");

            sections.forEach(section => section.classList.remove("active"));
            const targetSection = document.getElementById(link.dataset.section);
            if (targetSection) {
                targetSection.classList.add("active");
            }
            updateDashboard();
            renderExpenses();
            renderGoals();
        });
    });

    // Modais
    addExpenseBtn.addEventListener("click", () => expenseModal.classList.add("active"));
    closeExpenseModal.addEventListener("click", () => expenseModal.classList.remove("active"));
    cancelExpenseBtn.addEventListener("click", () => expenseModal.classList.remove("active"));
    window.addEventListener("click", (e) => {
        if (e.target === expenseModal) {
            expenseModal.classList.remove("active");
        }
        if (e.target === goalModal) {
            goalModal.classList.remove("active");
        }
    });

    addGoalBtn.addEventListener("click", () => goalModal.classList.add("active"));
    closeGoalModal.addEventListener("click", () => goalModal.classList.remove("active"));
    cancelGoalBtn.addEventListener("click", () => goalModal.classList.remove("active"));

    // Gerenciamento de Gastos
    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const description = document.getElementById("expense-description").value;
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;

        if (description && amount && category && date) {
            expenses.push({ description, amount, category, date });
            localStorage.setItem("expenses", JSON.stringify(expenses));
            expenseForm.reset();
            expenseModal.classList.remove("active");
            renderExpenses();
            updateDashboard();
            showNotification("Gasto adicionado com sucesso!", "success");
        } else {
            showNotification("Por favor, preencha todos os campos do gasto.", "error");
        }
    });

    function renderExpenses() {
        expensesList.innerHTML = "";
        const filteredExpenses = applyExpenseFilters(expenses);

        if (filteredExpenses.length === 0) {
            expensesList.innerHTML = 
                `<div style="text-align: center; padding: 20px; color: #777;">
                    Nenhum gasto encontrado. Adicione um novo gasto!
                </div>`;
            return;
        }

        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredExpenses.forEach((expense, index) => {
            const expenseItem = document.createElement("div");
            expenseItem.classList.add("expense-item");
            expenseItem.innerHTML = `
                <div class="expense-info">
                    <h4>${expense.description}</h4>
                    <p>${new Date(expense.date).toLocaleDateString()} - ${expense.category}</p>
                </div>
                <div class="expense-amount">- R$ ${expense.amount.toFixed(2).replace(".", ",")}</div>
                <button class="btn-delete-expense" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            expensesList.appendChild(expenseItem);
        });

        document.querySelectorAll(".btn-delete-expense").forEach(button => {
            button.addEventListener("click", (e) => {
                const indexToDelete = parseInt(e.currentTarget.dataset.index);
                expenses.splice(indexToDelete, 1);
                localStorage.setItem("expenses", JSON.stringify(expenses));
                renderExpenses();
                updateDashboard();
                showNotification("Gasto removido.", "info");
            });
        });
    }

    // Filtros de gastos
    document.getElementById("category-filter").addEventListener("change", renderExpenses);
    document.getElementById("date-filter").addEventListener("change", renderExpenses);

    function applyExpenseFilters(expenseArray) {
        let tempExpenses = [...expenseArray];
        const categoryFilter = document.getElementById("category-filter").value;
        const dateFilter = document.getElementById("date-filter").value;

        if (categoryFilter) {
            tempExpenses = tempExpenses.filter(exp => exp.category === categoryFilter);
        }
        if (dateFilter) {
            tempExpenses = tempExpenses.filter(exp => exp.date === dateFilter);
        }
        return tempExpenses;
    }

    // Gerenciamento de Metas
    goalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("goal-title").value;
        const targetAmount = parseFloat(document.getElementById("goal-amount").value);
        const currentAmount = parseFloat(document.getElementById("goal-current").value);
        const deadline = document.getElementById("goal-deadline").value;

        if (title && targetAmount && deadline) {
            goals.push({ title, targetAmount, currentAmount, deadline });
            localStorage.setItem("goals", JSON.stringify(goals));
            goalForm.reset();
            goalModal.classList.remove("active");
            renderGoals();
            updateDashboard();
            showNotification("Meta adicionada com sucesso!", "success");
        } else {
            showNotification("Por favor, preencha todos os campos da meta.", "error");
        }
    });

    function renderGoals() {
        goalsGrid.innerHTML = "";
        if (goals.length === 0) {
            goalsGrid.innerHTML = 
                `<div style="text-align: center; padding: 20px; color: #777; grid-column: 1 / -1;">
                    Nenhuma meta definida. Crie sua primeira meta!
                </div>`;
            return;
        }

        goals.forEach((goal, index) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const goalCard = document.createElement("div");
            goalCard.classList.add("goal-card");
            goalCard.innerHTML = `
                <h4>${goal.title}</h4>
                <p>Alvo: R$ ${goal.targetAmount.toFixed(2).replace(".", ",")}</p>
                <div class="goal-progress-bar">
                    <div class="goal-progress" style="width: ${Math.min(progress, 100)}%;"></div>
                </div>
                <div class="goal-details">
                    <span>R$ ${goal.currentAmount.toFixed(2).replace(".", ",")}</span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <p style="font-size: 12px; color: #999; margin-top: 10px;">Prazo: ${new Date(goal.deadline).toLocaleDateString()}</p>
                <button class="btn-delete-goal" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            goalsGrid.appendChild(goalCard);
        });

        document.querySelectorAll(".btn-delete-goal").forEach(button => {
            button.addEventListener("click", (e) => {
                const indexToDelete = parseInt(e.currentTarget.dataset.index);
                goals.splice(indexToDelete, 1);
                localStorage.setItem("goals", JSON.stringify(goals));
                renderGoals();
                updateDashboard();
                showNotification("Meta removida.", "info");
            });
        });
    }

    // Atualizar Dashboard
    function updateDashboard() {
        const totalIncome = expenses.filter(exp => exp.amount < 0).reduce((sum, exp) => sum + Math.abs(exp.amount), 0); // Supondo que receitas seriam negativas ou separadas
        const totalExpenses = expenses.filter(exp => exp.amount > 0).reduce((sum, exp) => sum + exp.amount, 0);
        const currentBalance = totalIncome - totalExpenses + 2450; // Saldo inicial mockado

        document.getElementById("saldo-atual").textContent = `R$ ${currentBalance.toFixed(2).replace(".", ",")}`;
        document.getElementById("receitas-mes").textContent = `R$ ${totalIncome.toFixed(2).replace(".", ",")}`;
        document.getElementById("gastos-mes").textContent = `R$ ${totalExpenses.toFixed(2).replace(".", ",")}`;

        // Exemplo de alerta de gasto
        const alimentacaoGastos = expenses.filter(exp => exp.category === "alimentacao").reduce((sum, exp) => sum + exp.amount, 0);
        const orcamentoAlimentacao = 500; // Exemplo de orçamento
        if (alimentacaoGastos > orcamentoAlimentacao * 0.8) {
            document.querySelector(".alerts-section").innerHTML = `
                <h3>Alertas Importantes</h3>
                <div class="alert warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Atenção!</strong> Você gastou ${((alimentacaoGastos / orcamentoAlimentacao) * 100).toFixed(0)}% do seu orçamento de alimentação este mês.
                    </div>
                </div>
            `;
        } else {
            document.querySelector(".alerts-section").innerHTML = `
                <h3>Alertas Importantes</h3>
                <div class="alert success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Ótimo!</strong> Seu orçamento de alimentação está sob controle.
                    </div>
                </div>
            `;
        }

        // Gráficos (usando Chart.js)
        renderCharts(totalIncome, totalExpenses);
    }

    let receitasVsDespesasChart;
    let gastosPorCategoriaChart;

    function renderCharts(totalIncome, totalExpenses) {
        const ctx1 = document.getElementById("receitasVsDespesas").getContext("2d");
        if (receitasVsDespesasChart) receitasVsDespesasChart.destroy();
        receitasVsDespesasChart = new Chart(ctx1, {
            type: "bar",
            data: {
                labels: ["Receitas", "Despesas"],
                datasets: [{
                    label: "Valores (R$)",
                    data: [totalIncome, totalExpenses],
                    backgroundColor: [
                        "var(--primary-color)",
                        "var(--danger-color)"
                    ],
                    borderColor: [
                        "var(--primary-color)",
                        "var(--danger-color)"
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        const ctx2 = document.getElementById("gastosPorCategoria").getContext("2d");
        if (gastosPorCategoriaChart) gastosPorCategoriaChart.destroy();
        const categoryData = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        gastosPorCategoriaChart = new Chart(ctx2, {
            type: "pie",
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
                    ],
                    hoverBackgroundColor: [
                        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
                    ]
                }]
            },
            options: {
                responsive: true,
            }
        });
    }

    // Simulação de IA
    const aiSuggestions = [
        "Considerando seus gastos em lazer, você poderia economizar 10% e investir em um CDB com rentabilidade de 13,2% a.a.",
        "Seu perfil indica uma boa oportunidade em Tesouro Direto para reserva de emergência. Rentabilidade de 12,5% a.a.",
        "Com seus objetivos de longo prazo, fundos de investimento diversificados podem ser uma boa opção. Rentabilidade média de 15,8% a.a.",
        "Observamos que você tem um saldo positivo. Que tal explorar investimentos de baixo risco para começar a rentabilizar seu dinheiro?",
        "Para otimizar seus ganhos, considere diversificar seus investimentos. Pequenas quantias em diferentes ativos podem trazer bons retornos."
    ];

    getAiSuggestionBtn.addEventListener("click", () => {
        aiSuggestionText.textContent = "Analisando seu perfil financeiro...";
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * aiSuggestions.length);
            aiSuggestionText.textContent = aiSuggestions[randomIndex];
            showNotification("Nova sugestão de investimento da IA!", "info");
        }, 1500);
    });

    // Inicialização
    renderExpenses();
    renderGoals();
    updateDashboard();
    document.querySelector(".nav-link[data-section=\"dashboard\"]").click(); // Ativar dashboard por padrão
});