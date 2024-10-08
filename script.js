const SHEET_ID = '1bRSDJMOlb8CopdfPmM1hysHC_R8SIsKpGm6sYW2FTwA';
const API_KEY = 'AIzaSyANn8qYhn5-okzBTkQiY0UaJQXVWnY3078';
const SHEET_NAME = 'Form Responses 1';

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

const graduationDate = new Date('2025-06-26T00:00:00');

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
    const classCounts = {
        "XII-1": 0,
        "XII-2": 0,
        "XII-3": 0,
        "XII-4": 0,
        "XII-5": 0,
        "XII-6": 0,
        "XII-7": 0,
        "XII-8": 0,
        "XII-9": 0,
        "XII-10": 0,
        "XII-11": 0,
        "XII-12": 0
    };
    const batchCounts = {
        "Vasterix": 0,
        "Eterious": 0,
        "Vamouster": 0,
        "Pilihan Ganda": 0
    };

    rows.slice(1).forEach(row => {
        const kelas = row[1];
        const batch = row[2];

        if (classCounts[kelas] !== undefined) {
            classCounts[kelas]++;
        }

        if (batchCounts[batch] !== undefined) {
            batchCounts[batch]++;
        } else {
            batchCounts["Pilihan Ganda"]++;
        }
    });

    return { classCounts, batchCounts };
}

function updateProgressBar(batchCounts, classCounts) {
    const totalBatchResponses = 420; // Total students per batch
    const totalClassResponses = 35;  // Total students per class

    document.getElementById('option1').value = (batchCounts["Vasterix"] / totalBatchResponses) * 100;
    document.getElementById('option2').value = (batchCounts["Eterious"] / totalBatchResponses) * 100;
    document.getElementById('option3').value = (batchCounts["Vamouster"] / totalBatchResponses) * 100;
    document.getElementById('option4').value = (batchCounts["Pilihan Ganda"] / totalBatchResponses) * 100;

    // Update Class Progress Bars
    Object.keys(classCounts).forEach((kelas, index) => {
        const progressElement = document.getElementById(`kelas${index + 1}`);
        if (progressElement) {
            progressElement.value = (classCounts[kelas] / totalClassResponses) * 100;
        }
    });
}

function createChart(chartId, data) {
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
                    '#FF9F40',
                    '#FF5733',
                    '#DAF7A6',
                    '#FFC300',
                    '#C70039',
                    '#900C3F',
                    '#581845'
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

    // Kelas Chart
    createChart('kelasChart', classCounts); // Menampilkan data kelas

    // Nama Angkatan Chart
    createChart('namaAngkatanChart', batchCounts); // Menampilkan data Nama Angkatan

    // Update Progress Bars
    updateProgressBar(batchCounts, classCounts);
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

// window.onload = function() {
//     showCustomAlert(
//         'Udah ngisi form pemilihan nama angkatan blm? (klik CANCEL klo blm)',
//         function() {
//             // User clicked "Yes"
//         },
//         function() {
//             // User clicked "No"
//             window.open('https://forms.gle/EHbKP77aPvr95hxk7', '_blank');
//         }
//     );
// };
