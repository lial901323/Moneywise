let run;
let expenseSummary = {};


const updateBalance = async () => {
    const token = localStorage.getItem('userToken');
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





document.addEventListener('DOMContentLoaded', () => {
    let currentView = 'daily';
    let hourlyData, dailyData;
    let ctxMain = document.getElementById('mainChart').getContext('2d');

    const renderChart = (view) => {
        const labels = view === 'daily' ? hourlyData.labels : dailyData.labels;
        const income = view === 'daily' ? hourlyData.income : dailyData.income;
        const expense = view === 'daily' ? hourlyData.expense : dailyData.expense;

        if (window.mainChart && typeof window.mainChart.destroy === 'function') {
            window.mainChart.destroy();
        }

        window.mainChart = new Chart(ctxMain, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Income (₪)',
                        data: income,
                        borderColor: 'green',
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Expense (₪)',
                        data: expense,
                        borderColor: 'red',
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: view === 'daily' ? 'Hour of Day' : 'Day of Month' } },
                    y: { title: { display: true, text: 'Amount (₪)' }, beginAtZero: true }
                }
            }
        });

        document.getElementById('chart-title').textContent = view === 'daily' ? 'Daily Stats' : 'Monthly Stats';
        document.getElementById('toggle-chart').textContent = view === 'daily' ? 'Switch to Monthly' : 'Switch to Daily';
    };

    run = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const res = await fetch('https://moneywise-backend.onrender.com/api/auth/user-data', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            const username = data.username || 'User';
            document.getElementById('welcome-message').textContent = `Hi ${username}, Welcome back!`;

            const balanceRes = await fetch('https://moneywise-backend.onrender.com/api/stats/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const balanceData = await balanceRes.json();
            document.getElementById('balance-amount').textContent = `₪${balanceData.balance.toFixed(2)}`;

            const incomeTodayRes = await fetch('https://moneywise-backend.onrender.com/api/stats/income-today', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const incomeTodayData = await incomeTodayRes.json();
            document.getElementById('income-today').textContent = `₪${incomeTodayData.total.toFixed(2)}`;

            const expenseTodayRes = await fetch('https://moneywise-backend.onrender.com/api/stats/expense-today', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const expenseTodayData = await expenseTodayRes.json();
            document.getElementById('expense-today').textContent = `₪${expenseTodayData.total.toFixed(2)}`;

            const incomeMonthRes = await fetch('https://moneywise-backend.onrender.com/api/stats/income-month', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const incomeMonthData = await incomeMonthRes.json();
            document.getElementById('income-month').textContent = `₪${incomeMonthData.total.toFixed(2)}`;

            const expenseMonthRes = await fetch('https://moneywise-backend.onrender.com/api/stats/expense-month', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const expenseMonthData = await expenseMonthRes.json();
            document.getElementById('expense-month').textContent = `₪${expenseMonthData.total.toFixed(2)}`;

            const hourlyRes = await fetch('https://moneywise-backend.onrender.com/api/stats/hourly', {
                headers: { Authorization: `Bearer ${token}` }
            });
            hourlyData = await hourlyRes.json();

            const dailyRes = await fetch('https://moneywise-backend.onrender.com/api/stats/daily', {
                headers: { Authorization: `Bearer ${token}` }
            });
            dailyData = await dailyRes.json();

            renderChart(currentView);

        } catch (err) {
            console.error('Error fetching user info or stats:', err);
        }
    };

async function updateExpenseSummary() {
    const token = localStorage.getItem('userToken');
    try {
        const res = await fetch('https://moneywise-backend.onrender.com/api/expenses/monthly-summary', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        const list = document.getElementById('expense-summary-list');
        list.innerHTML = '';
        data.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item._id}</span> <span>₪${item.total.toFixed(2)}</span>`;
            list.appendChild(li);
        });

        const totalExpenses = data.reduce((sum, item) => sum + item.total, 0);
        const cardElement = document.getElementById('monthly-expenses-card');
        if (cardElement) {
            cardElement.textContent = `₪${totalExpenses.toFixed(2)}`;
        }
    } catch (err) {
        console.error('Error updating expense summary:', err);
    }
}


    run();
    document.getElementById('toggle-chart').addEventListener('click', () => {
        currentView = currentView === 'daily' ? 'monthly' : 'daily';
        renderChart(currentView);
    });

    


    document.getElementById('add-income').addEventListener('click', async () => {
    const amount = document.getElementById('income-input').value;
    const source = document.getElementById('income-source').value;
    const currency = document.getElementById('income-currency').value;

    if (!amount || !source) return alert("Please enter both amount and source.");

    const token = localStorage.getItem('userToken');

    await fetch('https://moneywise-backend.onrender.com/api/deposits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount), source, currency })
    });

    document.getElementById('income-input').value = '';
    document.getElementById('income-source').value = '';
    document.getElementById('income-currency').value = 'ILS';

    await new Promise(r => setTimeout(r, 500));
     run();
     updateBalance();
});

document.getElementById('add-expense').addEventListener('click', async () => {
    const amount = document.getElementById('expense-input').value;
    const category = document.getElementById('expense-category').value;
    const currency = document.getElementById('expense-currency').value;

    if (!amount || !category) return alert("Please enter both amount and category.");

    const token = localStorage.getItem('userToken');

    await fetch('https://moneywise-backend.onrender.com/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount), category, currency })
    });

    document.getElementById('expense-input').value = '';
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-currency').value = 'ILS';

    await new Promise(r => setTimeout(r, 500));
     run();
     updateBalance();
     updateExpenseSummary();
});




 updateExpenseSummary();




 document.getElementById('delete-account-btn').addEventListener('click', () => {
    document.getElementById('delete-account-modal').style.display = 'flex';
});

document.getElementById('cancel-delete').addEventListener('click', () => {
    document.getElementById('delete-account-modal').style.display = 'none';
});

document.getElementById('confirm-delete').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const accountCode = document.getElementById('account-code').value;

    if (!accountCode) {
        alert('Please enter your account code.');
        return;
    }

    try {
        const res = await fetch('https://moneywise-backend.onrender.com/api/users/delete-me', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ accountCode })
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            localStorage.clear();
            window.location.href = '/user-login.html';
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account');
    }
});


});
