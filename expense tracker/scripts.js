let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentDay = new Date().getDate();
let expenses = JSON.parse(localStorage.getItem('expenses')) || {};

const marvelBackgrounds = [
    'url("marvel/january.jpg")',
    'url("marvel/feb.jpg")',
    'url("marvel/mar.jpg")',
    'url("marvel/april.jpg")',
    'url("marvel/may.jpg")',
    'url("marvel/june.jpg")',
    'url("marvel/july.jpg")',
    'url("marvel/aug.jpg")',
    'url("marvel/sep.jpg")',
    'url("marvel/oct.jpg")',
    'url("marvel/nov.jpg")',
    'url("marvel/dec.jpg")'
];

function preloadImages() {
    marvelBackgrounds.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

function populateYearSelect() {
    const yearSelect = document.getElementById('yearSelect');
    for (let year = 2005; year <= 2050; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

function populateMonthSelect() {
    const monthSelect = document.getElementById('monthSelect');
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    monthNames.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = currentMonth;
}

function generateCalendar(year, month) {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    const calendarBackground = document.getElementById('calendarBackground');
    calendarBackground.style.backgroundImage = marvelBackgrounds[month];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let totalSpent = 0;
    let totalEarned = 0;

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day');

        const dayTitle = document.createElement('h4');
        dayTitle.textContent = day;
        dayCell.appendChild(dayTitle);

        const dayExpenses = document.createElement('div');
        dayExpenses.classList.add('expenses');

        const expenseList = expenses[`${year}-${month}-${day}`] || [];
        
        if (expenseList.length > 0) {
            const totalDaySpent = expenseList.reduce((acc, entry) => acc + entry.spent, 0);
            const totalDayEarned = expenseList.reduce((acc, entry) => acc + entry.earned, 0);

            const spentSpan = document.createElement('span');
            spentSpan.classList.add('spent');
            spentSpan.textContent = `Spent: ₹${totalDaySpent}`;

            const earnedSpan = document.createElement('span');
            earnedSpan.classList.add('earned');
            earnedSpan.textContent = `Earned: ₹${totalDayEarned}`;

            dayExpenses.appendChild(spentSpan);
            dayExpenses.appendChild(document.createElement('br'));
            dayExpenses.appendChild(earnedSpan);
            dayExpenses.appendChild(document.createElement('hr'));

            totalSpent += totalDaySpent;
            totalEarned += totalDayEarned;
        }

        dayCell.appendChild(dayExpenses);
        calendarGrid.appendChild(dayCell);

        dayCell.addEventListener('click', () => {
            currentDay = day;
            showExpenseEntry(year, month, day);
        });
    }

    updateTotalAmounts(totalSpent, totalEarned);
    document.getElementById('calendarMonthYear').textContent = `${getMonthName(month)} ${year}`;
}

function getMonthName(monthIndex) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
}

function updateTotalAmounts(totalSpent, totalEarned) {
    document.getElementById('totalSpent').textContent = `₹${totalSpent}`;
    document.getElementById('totalEarned').textContent = `₹${totalEarned}`;
}

function changeDate() {
    currentYear = parseInt(document.getElementById('yearSelect').value, 10);
    currentMonth = parseInt(document.getElementById('monthSelect').value, 10);
    generateCalendar(currentYear, currentMonth);
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
        updateSelectors();
    }
    generateCalendar(currentYear, currentMonth);
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
        updateSelectors();
    }
    generateCalendar(currentYear, currentMonth);
}

function updateSelectors() {
    document.getElementById('yearSelect').value = currentYear;
    document.getElementById('monthSelect').value = currentMonth;
}

function showExpenseEntry(year, month, day) {
    document.getElementById('calendarContainer').style.display = 'none';
    document.getElementById('expenseEntryContainer').style.display = 'block';
    document.getElementById('entryHeader').textContent = `Add Expenses for ${getMonthName(month)} ${day}, ${year}`;
    document.getElementById('entryList').innerHTML = '';

    const existingEntries = expenses[`${year}-${month}-${day}`] || [];
    existingEntries.forEach(entry => addEntry(entry.spent, entry.earned, entry.purpose));
}

function addEntry(spent = '', earned = '', purpose = '') {
    const entryList = document.getElementById('entryList');

    const entryItem = document.createElement('div');
    entryItem.classList.add('entry-item');

    entryItem.innerHTML = `
        <input type="number" placeholder="Amount Spent (₹)" value="${spent}" class="spent-input" aria-label="Amount Spent" />
        <input type="number" placeholder="Amount Earned (₹)" value="${earned}" class="earned-input" aria-label="Amount Earned" />
        <input type="text" placeholder="Purpose" value="${purpose}" class="purpose-input" aria-label="Purpose" />
        <button type="button" onclick="removeEntry(this)">Remove</button>
    `;

    entryList.appendChild(entryItem);
}

function removeEntry(button) {
    button.parentElement.remove();
}

function saveExpense() {
    const entries = Array.from(document.getElementsByClassName('entry-item'));
    const entryArray = entries.map(entry => {
        const spent = parseFloat(entry.querySelector('.spent-input').value) || 0;
        const earned = parseFloat(entry.querySelector('.earned-input').value) || 0;
        const purpose = entry.querySelector('.purpose-input').value;
        return { spent, earned, purpose };
    });

    expenses[`${currentYear}-${currentMonth}-${currentDay}`] = entryArray;

    localStorage.setItem('expenses', JSON.stringify(expenses));
    showCalendar();
}

function showCalendar() {
    document.getElementById('calendarContainer').style.display = 'block';
    document.getElementById('expenseEntryContainer').style.display = 'none';
    generateCalendar(currentYear, currentMonth);
}

function backupData() {
    const data = localStorage.getItem('expenses');
    if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    } else {
        alert('No data available to backup.');
    }
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', handleFileSelect, false);
    input.click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (validateData(data)) {
                    localStorage.setItem('expenses', JSON.stringify(data));
                    expenses = data;
                    generateCalendar(currentYear, currentMonth);
                    alert('Data restored successfully.');
                } else {
                    alert('Invalid data format.');
                }
            } catch (error) {
                alert('Failed to restore data. Invalid JSON format.');
            }
        };
        reader.readAsText(file);
    }
}

function validateData(data) {
    return data && typeof data === 'object' && !Array.isArray(data);
}

function exportData() {
    const data = localStorage.getItem('expenses');
    if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses_data.json';
        a.click();
        URL.revokeObjectURL(url);
    } else {
        alert('No data available to export.');
    }
}

window.onload = () => {
    preloadImages();
    populateYearSelect();
    populateMonthSelect();
    generateCalendar(currentYear, currentMonth);
};

document.getElementById('monthSelect').addEventListener('change', changeDate);
document.getElementById('yearSelect').addEventListener('change', changeDate);
document.getElementById('prevMonthButton').addEventListener('click', prevMonth);
document.getElementById('nextMonthButton').addEventListener('click', nextMonth);
document.getElementById('saveExpenseButton').addEventListener('click', saveExpense);
document.getElementById('backupDataButton').addEventListener('click', backupData);
document.getElementById('restoreDataButton').addEventListener('click', restoreData);
document.getElementById('exportDataButton').addEventListener('click', exportData);
