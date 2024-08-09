function updateCountdown() {
    const now = new Date();
    const timeDifference = graduationDate - now;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerHTML = `
        ${days} hari ${hours} jam ${minutes} menit ${seconds} detik
    `;
}

function fetchData() {
    return fetch(url)
        .then(response => response.json())
        .then(data => data.values);
}

function processData(rows) {
    const classCounts = {};
    const batchCounts = {
        "Vasterix": 0,
        "Eterious": 0,
        "Vamouster": 0,
        "Pilihan Ganda": 0
    };

    rows.slice(1).forEach(row => {
        const kelas = row[1];
        const batch = row[2];

        if (classCounts[kelas]) {
            classCounts[kelas]++;
        } else {
            classCounts[kelas] = 1;
        }

        if (batchCounts[batch]) {
            batchCounts[batch]++;
        } else {
            batchCounts["Pilihan Ganda"]++;
        }
    });

    return { classCounts, batchCounts };
}

function updateProgressBar(batchCounts) {
    const totalResponses = Object.values(batchCounts).reduce((sum, value) => sum + value, 0);

    document.getElementById('option1').value = (batchCounts["Vasterix"] / totalResponses) * 100;
    document.getElementById('option2').value = (batchCounts["Eterious"] / totalResponses) * 100;
    document.getElementById('option3').value = (batchCounts["Vamouster"] / totalResponses) * 100;
    document.getElementById('option4').value = (batchCounts["Pilihan Ganda"] / totalResponses) * 100;

    // Update progress bars for classes
    Object.keys(classCounts).forEach((kelas, index) => {
        const progressElement = document.getElementById(`kelas${index + 1}`);
        if (progressElement) {
            progressElement.value = (classCounts[kelas] / totalStudents) * 100;
        }
    });

    document.getElementById('totalResponses').textContent = totalResponses;
}

function createChart(chartId, data, label) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                            const value = context.raw;
                            const percentage = (value / total * 100).toFixed(2);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

async function updateCharts() {
    const rows = await fetchData();
    const { classCounts, batchCounts } = processData(rows);

    createChart('namaAngkatanChart', batchCounts, 'Nama Angkatan');
    createChart('kelasChart', classCounts, 'Kelas');

    updateProgressBar(batchCounts);
}

updateCountdown();
setInterval(updateCountdown, 1000); // Update countdown every second

updateCharts();

document.getElementById('aspirasiForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Pesan Anda telah terkirim!');
    document.getElementById('message').value = '';
});

function showCustomAlert(message, onConfirm, onCancel) {
    const confirmation = window.confirm(message);
    if (confirmation) {
        onConfirm();
    } else {
        onCancel();
    }
}

window.onload = function() {
    showCustomAlert(
        'Udah ngisi form pemilihan nama angkatan blm? (klik CANCEL klo blm)',
        function() {
            // User clicked "Yes"
        },
        function() {
            // User clicked "No"
            window.open('https://forms.gle/EHbKP77aPvr95hxk7', '_blank');
        }
    );
};
