// DOM Element References
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherResult = document.getElementById("weatherResult");
const unitToggleBtn = document.getElementById("unitToggleBtn");
const recentSearchesContainer = document.getElementById("recentSearches");

// Feature 5: State management for temperature unit ('C' or 'F')
let currentUnit = "C";
let currentDisplayedData = null; // Stores current search data for quick unit toggling

// Feature 8: Open-Meteo WMO Weather Code Mapping
function getWmoWeatherInfo(code) {
    switch (code) {
        case 0: return { condition: "Clear Sky", icon: "☀️" };
        case 1: case 2: case 3: return { condition: "Partly Cloudy", icon: "⛅" };
        case 45: case 48: return { condition: "Foggy", icon: "🌫️" };
        case 51: case 53: case 55: return { condition: "Drizzle", icon: "🌧️" };
        case 61: case 63: case 65: return { condition: "Rain", icon: "🌧️" };
        case 71: case 73: case 75: case 77: return { condition: "Snow", icon: "❄️" };
        case 80: case 81: case 82: return { condition: "Rain Showers", icon: "🌧️" };
        case 85: case 86: return { condition: "Snow Showers", icon: "❄️" };
        case 95: case 96: case 99: return { condition: "Thunderstorm", icon: "⚡" };
        default: return { condition: "Overcast", icon: "☁️" };
    }
}

// Feature 5: Temperature Conversion Helper
function formatTemperature(tempC) {
    if (tempC === null || tempC === undefined || isNaN(tempC)) return "--";
    if (currentUnit === "F") {
        const tempF = Math.round((tempC * 9 / 5) + 32);
        return `${tempF}°F`;
    }
    return `${Math.round(tempC)}°C`;
}

// Feature 6: LocalStorage Search History Functions
function getRecentSearches() {
    const saved = localStorage.getItem("weather_recent_searches");
    return saved ? JSON.parse(saved) : [];
}

function saveRecentSearch(cityName) {
    let recent = getRecentSearches();
    recent = recent.filter(item => item.toLowerCase() !== cityName.toLowerCase());
    recent.unshift(cityName);
    if (recent.length > 5) recent.pop();
    localStorage.setItem("weather_recent_searches", JSON.stringify(recent));
    renderRecentSearches();
}

function renderRecentSearches() {
    const recent = getRecentSearches();
    if (recent.length === 0) {
        recentSearchesContainer.innerHTML = "";
        return;
    }

    recentSearchesContainer.innerHTML = `
        <span class="recent-label">Recent:</span>
        ${recent.map(city => `<button class="chip" data-city="${city}">${city}</button>`).join('')}
    `;

    const chips = recentSearchesContainer.querySelectorAll(".chip");
    chips.forEach(chip => {
        chip.addEventListener("click", function () {
            const city = this.getAttribute("data-city");
            cityInput.value = city;
            performSearch();
        });
    });
}

// Loading state helper
function showLoadingState(message = "Fetching live weather data...") {
    searchBtn.disabled = true;
    if (locationBtn) locationBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    weatherResult.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

function resetLoadingState() {
    searchBtn.disabled = false;
    if (locationBtn) locationBtn.disabled = false;
    searchBtn.textContent = "Search";
}

// Render Weather Result Card & 5-Day Forecast Grid (Feature 10)
function renderWeatherCard(data) {
    currentDisplayedData = data;
    const formattedTemp = formatTemperature(data.tempC);

    const forecastHtml = (data.forecast && data.forecast.length > 0) ? `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-grid">
                ${data.forecast.map(day => `
                    <div class="forecast-card">
                        <span class="forecast-day">${day.day}</span>
                        <span class="forecast-icon">${day.icon}</span>
                        <div class="forecast-temps">
                            <span class="forecast-max">${formatTemperature(day.maxTempC)}</span>
                            <span class="forecast-min">${formatTemperature(day.minTempC)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    weatherResult.innerHTML = `
        <div class="weather-card">
            <h2>${data.icon} ${data.name}</h2>
            <div class="temperature">${formattedTemp}</div>
            <p class="condition">Condition: <strong>${data.condition}</strong></p>
            <div class="details">
                <p>💨 Wind: ${data.wind}</p>
            </div>
            ${forecastHtml}
        </div>
    `;
}

// Feature 8: Fetch Weather Data using Open-Meteo APIs (Async / Await & Fetch)
async function fetchWeatherData(lat, lon, locationLabel) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&windspeed_unit=kmh&timezone=auto`;

    const response = await fetch(weatherUrl);
    if (!response.ok) {
        throw new Error("Unable to fetch weather data from server.");
    }

    const data = await response.json();
    const currentWeather = data.current_weather;
    const wmoInfo = getWmoWeatherInfo(currentWeather.weathercode);

    // Feature 10: Process 5-Day Forecast Grid Data
    const daily = data.daily;
    const forecastDays = [];
    if (daily && daily.time) {
        for (let i = 0; i < Math.min(5, daily.time.length); i++) {
            const dateObj = new Date(daily.time[i] + 'T00:00:00');
            const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
            const dayWmo = getWmoWeatherInfo(daily.weathercode[i]);
            forecastDays.push({
                day: dayName,
                icon: dayWmo.icon,
                condition: dayWmo.condition,
                maxTempC: daily.temperature_2m_max[i],
                minTempC: daily.temperature_2m_min[i]
            });
        }
    }

    const weatherPayload = {
        name: locationLabel,
        tempC: currentWeather.temperature,
        condition: wmoInfo.condition,
        icon: wmoInfo.icon,
        wind: `${Math.round(currentWeather.windspeed)} km/h`,
        forecast: forecastDays
    };

    renderWeatherCard(weatherPayload);
    saveRecentSearch(locationLabel);
}

// Search by City Name using Open-Meteo Geocoding API
async function searchByCityName(cityQuery) {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=en&format=json`;

    const response = await fetch(geocodingUrl);
    if (!response.ok) {
        throw new Error("Geocoding service error.");
    }

    const geoData = await response.json();
    if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`City "${cityQuery}" not found. Please check spelling.`);
    }

    const location = geoData.results[0];
    const cityLabel = `${location.name}${location.country ? `, ${location.country}` : ''}`;
    await fetchWeatherData(location.latitude, location.longitude, cityLabel);
}

// Main Search Function
async function performSearch() {
    const cityQuery = cityInput.value.trim();

    if (cityQuery === "") {
        weatherResult.innerHTML = `<p class="error-msg">⚠️ Please enter a city name.</p>`;
        return;
    }

    showLoadingState(`Fetching weather for "${cityQuery}"...`);

    try {
        await searchByCityName(cityQuery);
    } catch (err) {
        weatherResult.innerHTML = `<p class="error-msg">⚠️ ${err.message}</p>`;
    } finally {
        resetLoadingState();
    }
}

// Feature 9: Geolocation Support ("Use My Location")
if (locationBtn) {
    locationBtn.addEventListener("click", function () {
        if (!navigator.geolocation) {
            weatherResult.innerHTML = `<p class="error-msg">⚠️ Geolocation is not supported by your browser.</p>`;
            return;
        }

        showLoadingState("Detecting your location coordinates...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    await fetchWeatherData(lat, lon, "Your Location");
                } catch (err) {
                    weatherResult.innerHTML = `<p class="error-msg">⚠️ ${err.message}</p>`;
                } finally {
                    resetLoadingState();
                }
            },
            (error) => {
                resetLoadingState();
                weatherResult.innerHTML = `<p class="error-msg">⚠️ Unable to retrieve location (${error.message}).</p>`;
            }
        );
    });
}

// Feature 5: Unit Toggle Event Listener
unitToggleBtn.addEventListener("click", function () {
    currentUnit = currentUnit === "C" ? "F" : "C";
    unitToggleBtn.textContent = `°${currentUnit}`;
    
    if (currentDisplayedData) {
        renderWeatherCard(currentDisplayedData);
    }
});

// Event Listeners
searchBtn.addEventListener("click", performSearch);

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        performSearch();
    }
});

// Initialize Search History Chips on Page Load
renderRecentSearches();