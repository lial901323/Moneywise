document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('userToken');

    async function loadHistory() {
        const incomeRes = await fetch('https://moneywise-backend.onrender.com/api/incomes', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const incomes = await incomeRes.json();

        const incomeTable = document.getElementById('income-history');
        incomeTable.innerHTML = '';
        incomes.forEach(i => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i.amount.toFixed(2)}</td>
                <td>${i.source}</td>
                <td>${new Date(i.date).toLocaleDateString()}</td>
                <td><button class="delete-btn" data-id="${i._id}" data-type="income">Delete</button></td>
            `;
            incomeTable.appendChild(row);
        });

        const expenseRes = await fetch('https://moneywise-backend.onrender.com/api/expenses', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const expenses = await expenseRes.json();

        const expenseTable = document.getElementById('expense-history');
        expenseTable.innerHTML = '';
        expenses.forEach(e => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${e.amount.toFixed(2)}</td>
                <td>${e.category}</td>
                <td>${new Date(e.date).toLocaleDateString()}</td>
                <td><button class="delete-btn" data-id="${e._id}" data-type="expense">Delete</button></td>
            `;
            expenseTable.appendChild(row);
        });
    }

    const updateBalance = async () => {
        try {
            const res = await fetch('https://moneywise-backend.onrender.com/api/stats/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            document.getElementById('balance-amount').textContent = `₪${data.balance.toFixed(2)}`;
        } catch (err) {
            console.error('Error updating balance:', err);
        }
    };

    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            const type = e.target.dataset.type;

            const url = type === 'income' 
                ? `https://moneywise-backend.onrender.com/api/incomes/${id}`
                : `https://moneywise-backend.onrender.com/api/expenses/${id}`;

            await fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            await loadHistory();
            await updateBalance();
        }
    });

    loadHistory();
    updateBalance();
});
