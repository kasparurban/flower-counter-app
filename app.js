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
    const block = document.getElementById('block').value;
    const row = document.getElementById('row').value;

    if (name && managementArea && block && row) {
        const timestamp = new Date().toISOString();  // Include timestamp with milliseconds

        const entry = {
            name,
            managementArea,
            block,
            row,
            value,
            timestamp
        }

        offlineData.push(entry);
        localStorage.setItem('offlineData', JSON.stringify(offlineData));

        // Provide haptic and sound feedback
        navigator.vibrate(100);  // Vibration for 100ms
        const audio = new Audio('ding.mp3');  // Add your ding sound file in the same folder
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
        + ["Timestamp,Name,Management Area,Block,Row,Value"]
        + "\n"
        + offlineData.map(entry => `${entry.timestamp},${entry.name},${entry.managementArea},${entry.block},${entry.row},${entry.value}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'counter_data.csv');
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}

// View Logged Data (show data in a table)
document.getElementById('viewDataButton').addEventListener('click', showViewDataPage);
document.getElementById('backButton').addEventListener('click', showMainPage);

function showViewDataPage() {
    populateTable();  // Populate the data table with the logged data
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('viewDataPage').style.display = 'block';
}

function showMainPage() {
    document.getElementById('viewDataPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
}

function populateTable() {
    const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';  // Clear any existing rows

    if (offlineData.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = "No data available.";
    } else {
        offlineData.forEach((entry) => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = entry.timestamp;
            row.insertCell(1).textContent = entry.name;
            row.insertCell(2).textContent = entry.managementArea;
            row.insertCell(3).textContent = entry.block;
            row.insertCell(4).textContent = entry.row;
            row.insertCell(5).textContent = entry.value;
        });
    }
}

function changeButtonColor(button) {
    // Add the 'active' class to change the button color
    button.classList.add('active');

    // Optional: Reset the color after a short delay (for visual feedback)
    setTimeout(() => {
        button.classList.remove('active');
    }, 200); // Adjust delay if needed
}


// Add the event listener for the Delete Data button
document.getElementById('deleteDataButton').addEventListener('click', confirmAndDeleteData);

// Function to confirm and delete data
function confirmAndDeleteData() {
    // Show a confirmation alert
    const confirmation = confirm("Are you sure you want to delete all data? This action cannot be undone.");
    
    if (confirmation) {
        // Clear the localStorage data
        localStorage.removeItem('offlineData');
        alert("All data has been deleted.");
        offlineData = [];

        // Clear the displayed data in the table
        const tableBody = document.getElementById('dataTableBody');
        tableBody.innerHTML = ""; // Clear the table

        // Optionally refresh the page or update the data display after deletion
    }
}

