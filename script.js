const SHEET_ID = '1bRSDJMOlb8CopdfPmM1hysHC_R8SIsKpGm6sYW2FTwA';
const API_KEY = 'AIzaSyANn8qYhn5-okzBTkQiY0UaJQXVWnY3078';
const SHEET_NAME = 'Form Responses 1';

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

const totalStudents = 420;
const classStudentCounts = {
    "XII-1": 35,
    "XII-2": 35,
    "XII-3": 35,
    "XII-4": 35,
    "XII-5": 35,
    "XII-6": 35,
    "XII-7": 35,
    "XII-8": 35,
    "XII-9": 35,
    "XII-10": 35,
    "XII-11": 35,
    "XII-12": 35
};

async function fetchData() {
    const response = await fetch(url);
    const data = await response.json();
    return data.values;
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

        // Menghitung jumlah Kelas
        if (classCounts[kelas]) {
            classCounts[kelas]++;
        } else {
            classCounts[kelas] = 1;
        }

        // Menghitung jumlah Nama Angkatan
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

    createChart('classChart', classCounts, 'Kelas');
    createChart('batchChart', batchCounts, 'Nama Angkatan');

    updateProgressBar(batchCounts);
}

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

// window.onload = function() {
//     if (confirm('Udah ngisi formulir pemilihan nama angkatan blm?')) {
//         alert('Sip, makasih ya :)')
//     } else {
//         window.location.href = 'https://forms.gle/EHbKP77aPvr95hxk7', '_blank';
//     }
// }
