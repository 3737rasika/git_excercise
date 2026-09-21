document.addEventListener("DOMContentLoaded", function () {

    // DAILY PRODUCTION LINE CHART
    fetch("/inventory/daily-production")
        .then(res => res.json())
        .then(data => {

            const dates = data.map(d => d.date);
            const quantities = data.map(d => d.total_quantity);

            new Chart(document.getElementById("productionChart"), {
                type: "line",
                data: {
                    labels: dates,
                    datasets: [{
                        label: "Daily Production",
                        data: quantities,
                        tension: 0.4,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(error => console.error("Error:", error));

    // CURRENT STOCK BAR CHART
    fetch("/inventory/current-stock")
        .then(res => res.json())
        .then(data => {

            const names = data.map(d => d.name);
            const stocks = data.map(d => d.stock);

            new Chart(document.getElementById("stockChart"), {
                type: "bar",
                data: {
                    labels: names,
                    datasets: [{
                        label: "Stock Quantity",
                        data: stocks,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(error => console.error("Error:", error));
});