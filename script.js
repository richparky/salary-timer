let timer = null;
let hourlyWage = 0;
let earned = 0;
let fishEarnings = 0;
let workSeconds = 0;
let lastStartTime = null;

let currency = document.getElementById('currencySelect').value;

document.getElementById('currencySelect').addEventListener('change', (e) => {
  currency = e.target.value;
  updateAllCurrency();
});

const countrySelect = document.getElementById('countrySelect');
const workdaysDisplay = document.getElementById('workdaysDisplay');

const countries = [
  { code: 'EE', name: 'Estonia' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' }
];
countries.forEach(c => {
  const option = document.createElement('option');
  option.value = c.code;
  option.innerText = c.name;
  countrySelect.appendChild(option);
});

countrySelect.addEventListener('change', () => {
  updateWorkdays();
});

async function fetchHolidays(countryCode, year) {
  const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.map(d => d.date);
}

async function updateWorkdays() {
  const country = countrySelect.value;
  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  const holidays = await fetchHolidays(country, year);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workdays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dateStr = date.toISOString().slice(0,10);
    const isHoliday = holidays.includes(dateStr);
    if (!isWeekend && !isHoliday) workdays++;
  }

  workdaysDisplay.innerText = `You need to work ${workdays} days this month`;
  window.currentWorkdays = workdays;
}

document.getElementById('startBtn').addEventListener('click', () => {
  const salary = Number(document.getElementById('salary').value);
  const workdays = window.currentWorkdays || 20;

  hourlyWage = salary / (workdays * 8);
  updateAllCurrency();

  if (!timer) {
    lastStartTime = Date.now();
    timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastStartTime) / 1000);
      const totalSeconds = workSeconds + elapsed;
      earned = hourlyWage * (totalSeconds / 3600);
      updateAllCurrency();

      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2,'0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2,'0');
      const seconds = String(totalSeconds % 60).padStart(2,'0');
      document.getElementById('timer').innerText = `${hours}:${minutes}:${seconds}`;
    }, 1000);
  }
});

document.getElementById('stopBtn').addEventListener('click', () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    workSeconds += Math.floor((Date.now() - lastStartTime) / 1000);
  }
});

document.getElementById('fishBtn').addEventListener('click', () => {
  const fishIncome = hourlyWage * (5 / 60);
  fishEarnings += fishIncome;
  earned += fishIncome;
  updateAllCurrency();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  clearInterval(timer);
  timer = null;
  earned = 0;
  fishEarnings = 0;
  workSeconds = 0;
  lastStartTime = null;
  document.getElementById('earned').innerText = `0 ${currency}`;
  document.getElementById('fishEarnings').innerText = `0 ${currency}`;
  document.getElementById('hourlyWage').innerText = `0 ${currency}`;
  document.getElementById('timer').innerText = "00:00:00";
});

function updateAllCurrency() {
  document.getElementById('hourlyWage').innerText = `${hourlyWage.toFixed(2)} ${currency}`;
  document.getElementById('earned').innerText = `${earned.toFixed(2)} ${currency}`;
  document.getElementById('fishEarnings').innerText = `${fishEarnings.toFixed(2)} ${currency}`;
}

updateWorkdays();
