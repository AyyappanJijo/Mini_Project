// ── API Key Management ──────────────────────────────────────────────
let API_KEY = localStorage.getItem('owm_key') || '';

function updateNotice() {
  document.getElementById('apiNotice').style.display = API_KEY ? 'none' : 'block';
  if (API_KEY) document.getElementById('apiKeyInput').value = API_KEY;
}

function saveKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (!val) return;
  API_KEY = val;
  localStorage.setItem('owm_key', val);
  updateNotice();
  showMsg('');
}

// ── Weather Code → Emoji ─────────────────────────────────────────────
function getEmoji(id, isNight) {
  if (id >= 200 && id < 300) return '⛈';
  if (id >= 300 && id < 400) return '🌦';
  if (id >= 500 && id < 600) {
    if (id === 511) return '🌨';
    if (id >= 502) return '🌧';
    return '🌧';
  }
  if (id >= 600 && id < 700) return '❄️';
  if (id === 701 || id === 741) return '🌫';
  if (id === 800) return isNight ? '🌙' : '☀️';
  if (id === 801) return isNight ? '🌙' : '🌤';
  if (id === 802) return '⛅';
  if (id >= 803) return '☁️';
  return '🌡';
}

function isNightTime(dt, sunrise, sunset) {
  return dt < sunrise || dt > sunset;
}

// ── UI Helpers ────────────────────────────────────────────────────────
function showMsg(type, text = '') {
  document.getElementById('loadingMsg').classList.remove('show');
  document.getElementById('errorMsg').classList.remove('show');
  if (type === 'loading') {
    document.getElementById('loadingMsg').classList.add('show');
  }
  if (type === 'error') {
    document.getElementById('errorMsg').textContent = '⚠ ' + text;
    document.getElementById('errorMsg').classList.add('show');
  }
}

function hideAll() {
  document.getElementById('mainCard').classList.remove('show');
  document.getElementById('forecastGrid').classList.remove('show');
  document.getElementById('hourlyRow').classList.remove('show');
  document.getElementById('forecastTitle').style.display = 'none';
  document.getElementById('hourlyTitle').style.display = 'none';
}

// ── Fetch Weather Data ────────────────────────────────────────────────
async function fetchWeather(query) {
  if (!API_KEY) {
    showMsg('error', 'Please save your API key first.');
    return;
  }
  hideAll();
  showMsg('loading');

  try {
    const base = 'https://api.openweathermap.org/data/2.5';
    const [cur, fore] = await Promise.all([
      fetch(`${base}/weather?${query}&units=metric&appid=${API_KEY}`).then(r => r.json()),
      fetch(`${base}/forecast?${query}&units=metric&appid=${API_KEY}`).then(r => r.json())
    ]);

    if (cur.cod && cur.cod !== 200) throw new Error(cur.message || 'City not found');
    if (fore.cod && fore.cod !== '200') throw new Error(fore.message || 'Forecast unavailable');

    showMsg('');
    renderMain(cur);
    renderHourly(fore);
    renderForecast(fore);
  } catch (e) {
    showMsg('error', e.message);
  }
}

// ── Render: Current Weather ───────────────────────────────────────────
function renderMain(d) {
  const night = isNightTime(d.dt, d.sys.sunrise, d.sys.sunset);

  document.getElementById('cityName').textContent = d.name;
  document.getElementById('countryTag').textContent = d.sys.country;
  document.getElementById('mainIcon').textContent = getEmoji(d.weather[0].id, night);
  document.getElementById('condition').textContent = d.weather[0].description;
  document.getElementById('tempBig').innerHTML = `${Math.round(d.main.temp)}<sup>°C</sup>`;
  document.getElementById('feelsLike').textContent = `Feels like ${Math.round(d.main.feels_like)}°C`;

  const wind_dir = ['N','NE','E','SE','S','SW','W','NW'][Math.round(d.wind.deg / 45) % 8] || '—';
  const stats = [
    { icon: '💧', label: 'Humidity',    value: d.main.humidity + '%' },
    { icon: '🌬', label: 'Wind',        value: Math.round(d.wind.speed * 3.6) + ' km/h ' + wind_dir },
    { icon: '🌡', label: 'Pressure',    value: d.main.pressure + ' hPa' },
    { icon: '👁', label: 'Visibility',  value: d.visibility ? (d.visibility / 1000).toFixed(1) + ' km' : '—' },
    { icon: '☁', label: 'Cloud Cover', value: d.clouds.all + '%' },
    { icon: '🌅', label: 'Sunrise',     value: new Date(d.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ];

  document.getElementById('statsRow').innerHTML = stats.map(s => `
    <div class="stat-item">
      <div class="stat-label">${s.icon} ${s.label}</div>
      <div class="stat-value">${s.value}</div>
    </div>`).join('');

  document.getElementById('mainCard').classList.add('show');
}

// ── Render: Hourly Forecast ───────────────────────────────────────────
function renderHourly(fore) {
  const next8 = fore.list.slice(0, 8);

  document.getElementById('hourlyRow').innerHTML = next8.map(h => {
    const t = new Date(h.dt * 1000);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="glass hour-card">
        <div class="hc-time">${label}</div>
        <span class="hc-icon">${getEmoji(h.weather[0].id, false)}</span>
        <div class="hc-temp">${Math.round(h.main.temp)}°</div>
      </div>`;
  }).join('');

  document.getElementById('hourlyTitle').style.display = 'block';
  document.getElementById('hourlyRow').classList.add('show');
}

// ── Render: 5-Day Forecast ────────────────────────────────────────────
function renderForecast(fore) {
  const days = {};

  fore.list.forEach(item => {
    const day = new Date(item.dt * 1000).toLocaleDateString('en', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });

  const entries = Object.entries(days).slice(0, 5);

  document.getElementById('forecastGrid').innerHTML = entries.map(([day, items]) => {
    const temps = items.map(i => i.main.temp);
    const hi    = Math.round(Math.max(...temps));
    const lo    = Math.round(Math.min(...temps));
    const mid   = items[Math.floor(items.length / 2)];
    const icon  = getEmoji(mid.weather[0].id, false);
    const parts = day.split(' ');

    return `
      <div class="glass forecast-card">
        <div class="fc-day">${parts[0]}<br>
          <small style="font-size:0.7rem;color:var(--muted)">${parts[1]} ${parts[2]}</small>
        </div>
        <span class="fc-icon">${icon}</span>
        <div class="fc-temp">${hi}°</div>
        <div class="fc-temp-low">${lo}°</div>
      </div>`;
  }).join('');

  document.getElementById('forecastTitle').style.display = 'block';
  document.getElementById('forecastGrid').classList.add('show');
}

// ── Actions ───────────────────────────────────────────────────────────
function searchWeather() {
  const city = document.getElementById('searchInput').value.trim();
  if (!city) return;
  fetchWeather(`q=${encodeURIComponent(city)}`);
}

function getGeo() {
  if (!navigator.geolocation) {
    showMsg('error', 'Geolocation not supported');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
    ()  => showMsg('error', 'Location access denied')
  );
}

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNotice();
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchWeather();
  });
});