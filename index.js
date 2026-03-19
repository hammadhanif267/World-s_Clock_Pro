const hr = document.getElementById('hr');
const mn = document.getElementById('mn');
const sc = document.getElementById('sc');
const digitalTime = document.getElementById('digitalTime');
const dateText = document.getElementById('dateText');
const zoneText = document.getElementById('zoneText');
const timezoneSelect = document.getElementById('timezoneSelect');
const themeToggle = document.getElementById('themeToggle');
const formatToggle = document.getElementById('formatToggle');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const worldClocks = document.getElementById('worldClocks');

let is24Hour = true;
let alarmTime = null;
let alarmAudio = null;

const savedTheme = localStorage.getItem('clock-theme');
if (savedTheme === 'light') {
  document.body.classList.add('light');
}

const cities = [
  { name: 'Karachi', zone: 'Asia/Karachi' },
  { name: 'London', zone: 'Europe/London' },
  { name: 'New York', zone: 'America/New_York' },
  { name: 'Tokyo', zone: 'Asia/Tokyo' },
  { name: 'Dubai', zone: 'Asia/Dubai' },
  { name: 'Sydney', zone: 'Australia/Sydney' }
];

function getParts(timeZone) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(now);
  const map = {};
  parts.forEach(part => map[part.type] = part.value);

  return {
    weekday: map.weekday,
    year: map.year,
    month: map.month,
    day: map.day,
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10)
  };
}

function formatTime(hour, minute, second) {
  if (is24Hour) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';
  let h = hour % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} ${suffix}`;
}

function updateClock() {
  const zone = timezoneSelect.value;
  const t = getParts(zone);

  const h12 = t.hour % 12;
  const hourDeg = h12 * 30 + t.minute * 0.5 + t.second * (0.5 / 60);
  const minuteDeg = t.minute * 6 + t.second * 0.1;
  const secondDeg = t.second * 6;

  hr.style.transform = `rotateZ(${hourDeg}deg)`;
  mn.style.transform = `rotateZ(${minuteDeg}deg)`;
  sc.style.transform = `rotateZ(${secondDeg}deg)`;

  digitalTime.textContent = formatTime(t.hour, t.minute, t.second);
  dateText.textContent = `${t.weekday}, ${t.month} ${t.day}, ${t.year}`;
  zoneText.textContent = `Time Zone: ${zone}`;

  checkAlarm(t.hour, t.minute);
  renderWorldClocks();
}

function renderWorldClocks() {
  worldClocks.innerHTML = '';
  cities.forEach(city => {
    const t = getParts(city.zone);
    const card = document.createElement('div');
    card.className = 'mini-clock';
    card.innerHTML = `
      <h4>${city.name}</h4>
      <div class="time">${formatTime(t.hour, t.minute, t.second)}</div>
      <div class="date-text">${t.weekday}</div>
    `;
    worldClocks.appendChild(card);
  });
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem(
    'clock-theme',
    document.body.classList.contains('light') ? 'light' : 'dark'
  );
});

formatToggle.addEventListener('click', () => {
  is24Hour = !is24Hour;
  formatToggle.textContent = is24Hour ? 'Switch to 12h' : 'Switch to 24h';
  updateClock();
});

timezoneSelect.addEventListener('change', updateClock);

fullscreenBtn.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

document.getElementById('setAlarmBtn').addEventListener('click', () => {
  const val = document.getElementById('alarmTime').value;
  if (!val) return;
  alarmTime = val;
  document.getElementById('alarmStatus').textContent = `Alarm set for ${val}`;
});

document.getElementById('clearAlarmBtn').addEventListener('click', () => {
  alarmTime = null;

  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }

  document.getElementById('alarmStatus').textContent = 'No alarm set';
});

function checkAlarm(hour, minute) {
  if (!alarmTime) return;

  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');

  if (`${hh}:${mm}` === alarmTime) {

    // 🔊 Play sound WITHOUT alert
    alarmAudio = new Audio('./alarm.mp3');
    alarmAudio.loop = true;
    alarmAudio.play();

    const alarmStatus = document.getElementById('alarmStatus');
    alarmStatus.textContent = '⏰ Alarm ringing!';
    alarmStatus.style.color = 'var(--accent)';

    // 🔘 Stop button
    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop Alarm';
    stopBtn.style.marginTop = '10px';

    stopBtn.onclick = () => {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      alarmStatus.textContent = 'Alarm stopped';
      alarmStatus.style.color = '';
      stopBtn.remove();
    };

    alarmStatus.appendChild(document.createElement('br'));
    alarmStatus.appendChild(stopBtn);

    alarmTime = null;
  }
}

let stopwatchSeconds = 0;
let stopwatchInterval = null;

function renderStopwatch() {
  const hrs = String(Math.floor(stopwatchSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((stopwatchSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(stopwatchSeconds % 60).padStart(2, '0');
  document.getElementById('stopwatchDisplay').textContent = `${hrs}:${mins}:${secs}`;
}

document.getElementById('startStopwatch').addEventListener('click', () => {
  if (stopwatchInterval) return;
  stopwatchInterval = setInterval(() => {
    stopwatchSeconds++;
    renderStopwatch();
  }, 1000);
});

document.getElementById('pauseStopwatch').addEventListener('click', () => {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
});

document.getElementById('resetStopwatch').addEventListener('click', () => {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
  stopwatchSeconds = 0;
  renderStopwatch();
});

let timerInterval = null;
let timerRemaining = 0;

function renderTimer() {
  const mins = String(Math.floor(timerRemaining / 60)).padStart(2, '0');
  const secs = String(timerRemaining % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${mins}:${secs}`;
}

document.getElementById('startTimer').addEventListener('click', () => {
  const mins = parseInt(document.getElementById('timerMinutes').value, 10);
  if (!mins || mins < 1) return;

  clearInterval(timerInterval);
  timerRemaining = mins * 60;
  renderTimer();

  timerInterval = setInterval(() => {
    timerRemaining--;
    renderTimer();

    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;

      // 🔊 Timer sound bhi add kar diya
      const audio = new Audio('./alarm.mp3');
      audio.play();
    }
  }, 1000);
});

document.getElementById('resetTimer').addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRemaining = 0;
  renderTimer();
});

renderStopwatch();
renderTimer();
updateClock();
setInterval(updateClock, 1000);