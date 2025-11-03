// src/index.js

let currentLocation = null;
let lastUpdateTime = 0;

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      const timeDiff = now - lastUpdateTime;

      // Only update if it's a fresh reading (new or 2+ seconds old)
      if (timeDiff > 2000) {
        const { latitude, longitude, accuracy } = position.coords;
        currentLocation = { latitude, longitude, accuracy, timestamp: now };
        lastUpdateTime = now;
        console.log("New GPS fix:", currentLocation);
      }
    },
    (error) => {
      console.error("GPS error:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,  // Never use cached location
      timeout: 5000   // Try again quickly if no fix
    }
  );
} else {
  console.warn("Geolocation not supported on this device.");
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
        //GPS change
        const entry = {
        name,
        managementArea,
        variety,
        plantingYear,
        block,
        row,
        direction,
        value,
        timestamp: localTimestamp,
        gps: currentLocation ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` : "No GPS"
        };
        //GPS change
        offlineData.push(entry);
        localStorage.setItem('offlineData', JSON.stringify(offlineData));

        navigator.vibrate(100);
    } else {
        alert("Please fill out all fields.");
    }
}

// Download Data as CSV
document.getElementById('IconDownloadButton').addEventListener('click', downloadData);

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

// Download Data as CSV
document.getElementById('downloadButton').addEventListener('click', downloadData);

function downloadData() {
    if (offlineData.length === 0) {
        alert("No data to download.");
        return;
    }
    //GPS change
    const csvContent = "data:text/csv;charset=utf-8,"
  + ["Timestamp,Name,Management Area,Variety,Planting Year,Block,Row,Direction,Value,GPS"]
  + "\n"
  + offlineData.map(entry => 
      `${entry.timestamp},${entry.name},${entry.managementArea},${entry.variety},${entry.plantingYear},${entry.block},${entry.row},${entry.direction},${entry.value},${entry.gps}`
    ).join("\n");

    //GPS change
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
        cell.colSpan = 10; // one extra column for delete button
        cell.textContent = "No data available.";
    } else {
        // iterate a reversed copy for display, but compute realIndex for operations
        offlineData.slice().reverse().forEach((entry, displayIndex) => {
            const row = tbody.insertRow();

            // compute index in the original offlineData array
            const realIndex = offlineData.length - 1 - displayIndex;

            // 🗑️ First column — delete button (uses realIndex)
            const deleteCell = row.insertCell(0);
            deleteCell.innerHTML = `<button onclick="deleteEntry(${realIndex})" style="background:none;color:#e63946;border:none;font-size:18px;cursor:pointer;">✖</button>`;

            // Editable data cells (shifted one index right)
            const timestampCell = row.insertCell(1);
            timestampCell.innerHTML = `<input disabled value="${entry.timestamp}" onchange="updateEntry(${realIndex}, 'timestamp', this.value)" />`;

            const valueCell = row.insertCell(2);
            valueCell.innerHTML = `<input value="${entry.value}" onchange="updateEntry(${realIndex}, 'value', this.value)" />`;

            const managementAreaCell = row.insertCell(3);
            managementAreaCell.innerHTML = `<input value="${entry.managementArea}" onchange="updateEntry(${realIndex}, 'managementArea', this.value)" />`;

            const varietyCell = row.insertCell(4);
            varietyCell.innerHTML = `<input value="${entry.variety}" onchange="updateEntry(${realIndex}, 'variety', this.value)" />`;

            const plantingYearCell = row.insertCell(5);
            plantingYearCell.innerHTML = `<input value="${entry.plantingYear}" onchange="updateEntry(${realIndex}, 'plantingYear', this.value)" />`;

            const blockCell = row.insertCell(6);
            blockCell.innerHTML = `<input value="${entry.block}" onchange="updateEntry(${realIndex}, 'block', this.value)" />`;

            const rowCell = row.insertCell(7);
            rowCell.innerHTML = `<input value="${entry.row}" onchange="updateEntry(${realIndex}, 'row', this.value)" />`;

            const directionCell = row.insertCell(8);
            directionCell.innerHTML = `<input value="${entry.direction}" onchange="updateEntry(${realIndex}, 'direction', this.value)" />`;

            const nameCell = row.insertCell(9);
            nameCell.innerHTML = `<input value="${entry.name}" onchange="updateEntry(${realIndex}, 'name', this.value)" />`;

            const gpsCell = row.insertCell(10);
            gpsCell.innerHTML = `<input value="${entry.gps}" onchange="updateEntry(${realIndex}, 'gps', this.value)" />`;


            
        });
    }
}


// Function to update an entry in offlineData and save it to localStorage
function updateEntry(index, field, newValue) {
    offlineData[index][field] = newValue;
    localStorage.setItem('offlineData', JSON.stringify(offlineData));
}

function deleteEntry(index) {
    const confirmation = confirm("Delete this row?");
    if (confirmation) {
        offlineData.splice(index, 1);
        localStorage.setItem('offlineData', JSON.stringify(offlineData));
        populateTable();
    }
}


// Add the event listener for the Delete Data button
document.getElementById('deleteDataButton').addEventListener('click', confirmAndDeleteData);

function confirmAndDeleteData() {
    const confirmation = confirm("Are you sure you want to delete all data? This action cannot be undone.");
    
    if (confirmation) {
      localStorage.removeItem('offlineData');
      offlineData = [];
      populateTable(); // refresh table immediately
      alert("All data has been deleted.");
    }
  }

const groveButtons = document.querySelectorAll(".grove-btn");
const mainPage = document.getElementById("mainPage");
const groveSelectionPage = document.getElementById("groveSelectionPage");
const managementAreaSelect = document.getElementById("managementArea");

// Define management areas by grove
const managementAreas = {
  boort: [
    "Allisons", "Andrews", "Arthurs", "Bains", "Barries", "Beatons", "Cables", "Dam", "Edgars", "Evans", "Fitzpatricks", "Flips", "Gearys", "Gills", "Hummels", "James", "Jonathan", "Keiths", "Kines", "Lanyons", "Lewis'","Little O'Donnells", "Logans", "Mathews", "McGraths", "Moloneys", "O'Donnells", "O'Mearas", "Parkers", "Pearces", "Pinks", "Weavers", "West", "Wychitella"
  ],
  boundaryBend: [
    "Alistair", "Burgess", "Cams", "Claudia", "Dam", "Daryll", "Fi", "Geds", "Grey", "Hoody", "JV2", "JV3", "JV4", "Kangaroo", "Kate", "Ken", "Kooly", "Leandro", "Norto", "Rail", "Reg", "Rob", "Sob", "Tracy"
  ],
    wemen: [
    "A Block", "B Block", "C Block", "D Block", "E Block", "F Block", "GE Block", "GW Block", "H Block"
  ],
  orana: [
    "A", "B", "C", "D", "E", "F", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"
  ]
};

// Handle grove selection
groveButtons.forEach(button => {
  button.addEventListener("click", () => {
    const grove = button.dataset.grove;

    // Clear old management area options
    managementAreaSelect.innerHTML = `<option value="" disabled selected>Management Area</option>`;

    // Populate with relevant management areas
    managementAreas[grove].forEach(area => {
      const option = document.createElement("option");
      option.value = area;
      option.textContent = area;
      managementAreaSelect.appendChild(option);
    });

    // Show main page, hide grove selection
    groveSelectionPage.style.display = "none";
    mainPage.style.display = "block";
  });
});

document.getElementById("changeGroveButton").addEventListener("click", () => {
    mainPage.style.display = "none";
    groveSelectionPage.style.display = "block";
  });
  