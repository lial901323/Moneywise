let run;

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
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'user-login.html';
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/user-data', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            const username = data.username || 'User';
            document.getElementById('welcome-message').textContent = `Hi ${username}, Welcome back!`;

            const balanceRes = await fetch('http://localhost:5000/api/stats/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const balanceData = await balanceRes.json();
            document.getElementById('balance-amount').textContent = `₪${balanceData.balance.toFixed(2)}`;

            const incomeTodayRes = await fetch('http://localhost:5000/api/stats/income-today', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const incomeTodayData = await incomeTodayRes.json();
            document.getElementById('income-today').textContent = `₪${incomeTodayData.total.toFixed(2)}`;

            const expenseTodayRes = await fetch('http://localhost:5000/api/stats/expense-today', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const expenseTodayData = await expenseTodayRes.json();
            document.getElementById('expense-today').textContent = `₪${expenseTodayData.total.toFixed(2)}`;

            const incomeMonthRes = await fetch('http://localhost:5000/api/stats/income-month', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const incomeMonthData = await incomeMonthRes.json();
            document.getElementById('income-month').textContent = `₪${incomeMonthData.total.toFixed(2)}`;

            const expenseMonthRes = await fetch('http://localhost:5000/api/stats/expense-month', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const expenseMonthData = await expenseMonthRes.json();
            document.getElementById('expense-month').textContent = `₪${expenseMonthData.total.toFixed(2)}`;

            const hourlyRes = await fetch('http://localhost:5000/api/stats/hourly', {
                headers: { Authorization: `Bearer ${token}` }
            });
            hourlyData = await hourlyRes.json();

            const dailyRes = await fetch('http://localhost:5000/api/stats/daily', {
                headers: { Authorization: `Bearer ${token}` }
            });
            dailyData = await dailyRes.json();

            renderChart(currentView);

        } catch (err) {
            console.error('Error fetching user info or stats:', err);
        }
    };

    run();

    document.getElementById('toggle-chart').addEventListener('click', () => {
        currentView = currentView === 'daily' ? 'monthly' : 'daily';
        renderChart(currentView);
    });

    document.getElementById('add-income').addEventListener('click', async () => {
        const amount = document.getElementById('income-input').value;
        const source = document.getElementById('income-source').value;
        if (!amount || !source) return alert("Please enter both amount and source.");

        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/deposits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                source: source.trim()
            })
        });

        document.getElementById('income-input').value = '';
        document.getElementById('income-source').value = '';
        run();
    });


    document.getElementById('add-expense').addEventListener('click', async () => {
        const amount = document.getElementById('expense-input').value;
        const category = document.getElementById('expense-source').value;

        if (!amount || !category) return alert("Please enter both amount and category.");

        const token = localStorage.getItem('token');

        await fetch('http://localhost:5000/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ amount: parseFloat(amount), category })
        });

        document.getElementById('expense-input').value = '';
        document.getElementById('expense-source').value = '';
        run();
    });

});
