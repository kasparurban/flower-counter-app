// src/index.js

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Store offline data in localStorage
let offlineData = JSON.parse(localStorage.getItem('offlineData')) || [];

// Add event listeners to the counter buttons
document.getElementById('button0').addEventListener('click', () => logCount(0));
document.getElementById('button1').addEventListener('click', () => logCount(1));
document.getElementById('button2').addEventListener('click', () => logCount(2));
document.getElementById('button3').addEventListener('click', () => logCount(3));
document.getElementById('button4').addEventListener('click', () => logCount(4));

// Function to log counts offline
function logCount(value) {
    const name = document.getElementById('name').value;
    const managementArea = document.getElementById('managementArea').value;
    const variety = document.getElementById('variety').value;
    const plantingYear = document.getElementById('plantingYear').value;
    const block = document.getElementById('block').value;
    const row = document.getElementById('row').value;
    const direction = document.getElementById('direction').value;

    if (name && managementArea && variety && block && row) {
        const now = new Date();
        const localTimestamp = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, '0') + "-" +
            String(now.getDate()).padStart(2, '0') + "T" +
            String(now.getHours()).padStart(2, '0') + ":" +
            String(now.getMinutes()).padStart(2, '0') + ":" +
            String(now.getSeconds()).padStart(2, '0') + "." +
            String(now.getMilliseconds()).padStart(3, '0');

        const entry = {
            name,
            managementArea,
            variety,
            plantingYear,
            block,
            row,
            direction,
            value,
            timestamp: localTimestamp
        };

        offlineData.push(entry);
        localStorage.setItem('offlineData', JSON.stringify(offlineData));

        navigator.vibrate(100);
        const audio = new Audio('ding.mp3');
        audio.play();
    } else {
        alert("Please fill out all fields.");
    }
}

// Download Data as CSV
document.getElementById('downloadButton').addEventListener('click', downloadData);

function downloadData() {
    if (offlineData.length === 0) {
        alert("No data to download.");
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
        + ["Timestamp,Name,Management Area,Variety,Planting Year,Block,Row,Direction,Value"]
        + "\n"
        + offlineData.map(entry => `${entry.timestamp},${entry.name},${entry.managementArea},${entry.variety},${entry.plantingYear},${entry.block},${entry.row},${entry.direction},${entry.value}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'counter_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// View Logged Data (show data in a table)
document.getElementById('viewDataButton').addEventListener('click', showViewDataPage);
document.getElementById('backButton').addEventListener('click', showMainPage);

function showViewDataPage() {
    populateTable();
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('viewDataPage').style.display = 'block';
}

function showMainPage() {
    document.getElementById('viewDataPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
}

function populateTable() {
    const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    if (offlineData.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 9;
        cell.textContent = "No data available.";
    } else {
        offlineData.forEach((entry, index) => {
            const row = tbody.insertRow();

            // Create editable cells with input elements
            const timestampCell = row.insertCell(0);
            timestampCell.innerHTML = `<input disabled value="${entry.timestamp}" onchange="updateEntry(${index}, 'timestamp', this.value)" />`;

            const nameCell = row.insertCell(1);
            nameCell.innerHTML = `<input value="${entry.name}" onchange="updateEntry(${index}, 'name', this.value)" />`;

            const managementAreaCell = row.insertCell(2);
            managementAreaCell.innerHTML = `<input value="${entry.managementArea}" onchange="updateEntry(${index}, 'managementArea', this.value)" />`;

            const varietyCell = row.insertCell(3);
            varietyCell.innerHTML = `<input value="${entry.variety}" onchange="updateEntry(${index}, 'variety', this.value)" />`;

            const plantingYearCell = row.insertCell(4);
            plantingYearCell.innerHTML = `<input value="${entry.plantingYear}" onchange="updateEntry(${index}, 'plantingYear', this.value)" />`;

            const blockCell = row.insertCell(5);
            blockCell.innerHTML = `<input value="${entry.block}" onchange="updateEntry(${index}, 'block', this.value)" />`;

            const rowCell = row.insertCell(6);
            rowCell.innerHTML = `<input value="${entry.row}" onchange="updateEntry(${index}, 'row', this.value)" />`;

            const directionCell = row.insertCell(7);
            directionCell.innerHTML = `<input value="${entry.direction}" onchange="updateEntry(${index}, 'direction', this.value)" />`;

            const valueCell = row.insertCell(8);
            valueCell.innerHTML = `<input value="${entry.value}" onchange="updateEntry(${index}, 'value', this.value)" />`;
        });
    }
}

// Function to update an entry in offlineData and save it to localStorage
function updateEntry(index, field, newValue) {
    offlineData[index][field] = newValue;
    localStorage.setItem('offlineData', JSON.stringify(offlineData));
}

// Add the event listener for the Delete Data button
document.getElementById('deleteDataButton').addEventListener('click', confirmAndDeleteData);

function confirmAndDeleteData() {
    const confirmation = confirm("Are you sure you want to delete all data? This action cannot be undone.");
    
    if (confirmation) {
        localStorage.removeItem('offlineData');
        alert("All data has been deleted.");
        offlineData = [];
        
        const tableBody = document.getElementById('dataTableBody');
        tableBody.innerHTML = "";
    }
}

