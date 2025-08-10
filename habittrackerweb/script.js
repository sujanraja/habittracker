// CONFIG
const BIN_ID = "6898ee43d0ea881f40561e0f";
const MASTER_KEY = "$2a$10$B1NO8e/W55aFFe7GdHmfTulJzyMAGNYFAKgFQqYGj6Nw3V4N58/kq";
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Dates
let startDate = new Date(2025, 7, 11); // July = 6 (0-based)
let days = 21;
let dateColumns = Array.from({ length: days }, (_, i) => {
    let d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d.toLocaleDateString("en-GB");
});

async function fetchData() {
    let res = await fetch(BASE_URL + "/latest", {
        headers: { "X-Master-Key": MASTER_KEY }
    });
    let json = await res.json();
    return json.record;
}

async function saveData(data) {
    await fetch(BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": MASTER_KEY
        },
        body: JSON.stringify(data)
    });
}

function renderTable(habits, datesData) {
    let table = document.createElement("table");

    // Header
    let headerRow = document.createElement("tr");
    let thHabit = document.createElement("th");
    thHabit.textContent = "Habit";
    headerRow.appendChild(thHabit);

    dateColumns.forEach(date => {
        let th = document.createElement("th");
        th.textContent = date;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Rows
    habits.forEach((habit, rowIndex) => {
        let tr = document.createElement("tr");

        let habitCell = document.createElement("td");
        habitCell.textContent = habit;
        habitCell.className = "habit-cell";
        tr.appendChild(habitCell);

        dateColumns.forEach(date => {
            let td = document.createElement("td");
            if (datesData[date] && datesData[date][rowIndex] === "SUCCESS") {
                td.textContent = "SUCCESS";
                td.className = "success";
            } else {
                let btn = document.createElement("button");
                btn.textContent = "☐";
                btn.addEventListener("click", async () => {
                    let data = await fetchData();
                    if (!data.Dates[date]) {
                        data.Dates[date] = Array(data.Habit.length).fill("");
                    }
                    data.Dates[date][rowIndex] = "SUCCESS";
                    await saveData(data);
                    renderTable(data.Habit, data.Dates);
                });
                td.appendChild(btn);
            }
            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    // Render
    let trackerDiv = document.getElementById("tracker");
    trackerDiv.innerHTML = "";
    trackerDiv.appendChild(table);
}

(async function init() {
    console.log("✅ JavaScript is running!");
    let data = await fetchData();
    renderTable(data.Habit, data.Dates);
})();
