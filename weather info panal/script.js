document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("weather-card");
    const cityInput = document.getElementById("city-input");
    const searchBtn = document.getElementById("search-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error-message");
    const weatherInfoEl = document.getElementById("weather-info");

    const tempEl = document.getElementById("temperature");
    const cityEl = document.getElementById("city-name");
    const descEl = document.getElementById("weather-desc");
    const iconEl = document.getElementById("weather-icon");
    const humidityEl = document.getElementById("humidity");
    const windEl = document.getElementById("wind-speed");
    const pressureEl = document.getElementById("pressure");

    // Smooth 3D Tilt Effect
    let tiltAnimationId;
    card.addEventListener("mousemove", (e) => {
        if (window.innerWidth <= 480) return; // Disable tilt on mobile for better UX
        
        cancelAnimationFrame(tiltAnimationId);
        
        tiltAnimationId = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Maximum rotation of 12 degrees
            const rotateX = ((y - centerY) / centerY) * -12; 
            const rotateY = ((x - centerX) / centerX) * 12;

            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });

    card.addEventListener("mouseleave", () => {
        cancelAnimationFrame(tiltAnimationId);
        card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
        card.style.transition = "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)";
    });

    card.addEventListener("mouseenter", () => {
        card.style.transition = "none";
    });

    // Dark/Light Theme Switcher
    let isDark = false;
    themeToggle.addEventListener("click", () => {
        isDark = !isDark;
        if (isDark) {
            body.setAttribute("data-theme", "dark");
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            body.removeAttribute("data-theme");
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });

    // API Handling function
    // Open-Meteo API doesn't require API keys
    const searchWeather = async (city) => {
        if (!city.trim()) return;

        showLoading();

        try {
            // Step 1: Geocoding (City name to Lat/Lon)
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                showError();
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // Step 2: Weather Fetch
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code,is_day`;
            const weatherRes = await fetch(weatherUrl);
            const weatherData = await weatherRes.json();

            // Wait a brief moment to show loading animation smoothly 
            setTimeout(() => {
                updateUI(weatherData.current, `${name}, ${country}`);
            }, 600);
            
        } catch (err) {
            console.error("Failed fetching weather data", err);
            showError();
        }
    };

    // State Management Helpers
    const showLoading = () => {
        weatherInfoEl.classList.add("hidden");
        errorEl.classList.add("hidden");
        loadingEl.classList.remove("hidden");
    };

    const showError = () => {
        loadingEl.classList.add("hidden");
        weatherInfoEl.classList.add("hidden");
        errorEl.classList.remove("hidden");
        
        // Reset to default theme on error state
        body.className = "cloudy";
    };

    // WMO Weather interpretation codes mapping
    const wmoInterpretation = {
        0: { desc: "Clear sky", type: "sunny", icon: "fa-sun" },
        1: { desc: "Mainly clear", type: "sunny", icon: "fa-sun" },
        2: { desc: "Partly cloudy", type: "cloudy", icon: "fa-cloud-sun" },
        3: { desc: "Overcast", type: "cloudy", icon: "fa-cloud" },
        45: { desc: "Fog", type: "cloudy", icon: "fa-smog" },
        48: { desc: "Depositing rime fog", type: "cloudy", icon: "fa-smog" },
        51: { desc: "Light drizzle", type: "rainy", icon: "fa-cloud-rain" },
        53: { desc: "Moderate drizzle", type: "rainy", icon: "fa-cloud-rain" },
        55: { desc: "Dense drizzle", type: "rainy", icon: "fa-cloud-rain" },
        56: { desc: "Light freezing drizzle", type: "rainy", icon: "fa-cloud-meatball" },
        57: { desc: "Dense freezing drizzle", type: "rainy", icon: "fa-cloud-meatball" },
        61: { desc: "Slight rain", type: "rainy", icon: "fa-cloud-showers-heavy" },
        63: { desc: "Moderate rain", type: "rainy", icon: "fa-cloud-showers-heavy" },
        65: { desc: "Heavy rain", type: "rainy", icon: "fa-cloud-showers-water" },
        66: { desc: "Light freezing rain", type: "rainy", icon: "fa-cloud-showers-water" },
        67: { desc: "Heavy freezing rain", type: "rainy", icon: "fa-cloud-showers-water" },
        71: { desc: "Slight snow fall", type: "snowy", icon: "fa-snowflake" },
        73: { desc: "Moderate snow fall", type: "snowy", icon: "fa-snowflake" },
        75: { desc: "Heavy snow fall", type: "snowy", icon: "fa-snowflake" },
        77: { desc: "Snow grains", type: "snowy", icon: "fa-snowflake" },
        80: { desc: "Slight rain showers", type: "rainy", icon: "fa-cloud-showers-heavy" },
        81: { desc: "Moderate rain showers", type: "rainy", icon: "fa-cloud-showers-heavy" },
        82: { desc: "Violent rain showers", type: "rainy", icon: "fa-cloud-showers-heavy" },
        85: { desc: "Slight snow showers", type: "snowy", icon: "fa-snowflake" },
        86: { desc: "Heavy snow showers", type: "snowy", icon: "fa-snowflake" },
        95: { desc: "Thunderstorm", type: "stormy", icon: "fa-cloud-bolt" },
        96: { desc: "Thunderstorm with slight hail", type: "stormy", icon: "fa-cloud-bolt" },
        99: { desc: "Thunderstorm with heavy hail", type: "stormy", icon: "fa-cloud-bolt" },
    };

    // Update UI Elements
    const updateUI = (current, locationName) => {
        const { temperature_2m, relative_humidity_2m, wind_speed_10m, surface_pressure, weather_code, is_day } = current;
        
        let weatherInfo = wmoInterpretation[weather_code] || { desc: "Unknown conditions", type: "cloudy", icon: "fa-cloud" };
        
        let themeType = weatherInfo.type;
        let iconClass = weatherInfo.icon;

        // Apply night time adjustments if sun is down
        if (is_day === 0) {
            if (themeType === "sunny") {
                themeType = "night";
                iconClass = "fa-moon";
            } else if (iconClass === "fa-cloud-sun") {
                iconClass = "fa-cloud-moon";
            }
        }

        // Apply dynamic background class to body
        body.className = themeType;

        // Update DOM values
        tempEl.textContent = Math.round(temperature_2m);
        cityEl.textContent = locationName;
        descEl.textContent = weatherInfo.desc;
        
        // Setup Icon properly
        iconEl.className = `fa-solid ${iconClass} weather-icon ${themeType}`;
        
        humidityEl.textContent = `${relative_humidity_2m}%`;
        windEl.textContent = `${wind_speed_10m} km/h`;
        pressureEl.textContent = `${Math.round(surface_pressure)} hPa`;

        // Switch visible states
        loadingEl.classList.add("hidden");
        errorEl.classList.add("hidden");
        weatherInfoEl.classList.remove("hidden");
    };

    // Event Listeners
    searchBtn.addEventListener("click", () => searchWeather(cityInput.value));
    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchWeather(cityInput.value);
            cityInput.blur(); // Dismiss mobile keyboard
        }
    });

    // Trigger initial search for default UI state
    searchWeather("New York");
});
