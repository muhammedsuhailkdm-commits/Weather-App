
const API_KEY = "379c3f6e1e16ad9f0d1719f147987242";

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");
const favoritesDiv = document.getElementById("favorites");
const addFavorite = document.getElementById("addFavorite");
const themeBtn = document.getElementById("themeBtn");

let currentCity = "";
let debounceTimer;

// Get weather data
async function getWeather(city) {
    loading.style.display = "block";
    error.textContent = "";
    currentWeather.style.display = "none";
    forecast.innerHTML = "";

    try {
        const currentURL =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentURL),
            fetch(forecastURL)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error("City not found. Please enter a valid city.");
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(currentData);
        displayForecast(forecastData);

        currentCity = currentData.name;

    } catch (err) {
        error.textContent = err.message;
    } finally {
        loading.style.display = "none";
    }
}

// Display current weather
function displayWeather(data) {
    currentWeather.style.display = "block";

    document.getElementById("city").textContent = data.name;

    document.getElementById("temperature").textContent =
        Math.round(data.main.temp) + "°C";

    document.getElementById("description").textContent =
        data.weather[0].description;

    document.getElementById("feelsLike").textContent =
        "Feels Like: " + Math.round(data.main.feels_like) + "°C";

    document.getElementById("humidity").textContent =
        "Humidity: " + data.main.humidity + "%";

    document.getElementById("wind").textContent =
        "Wind Speed: " + data.wind.speed + " m/s";
}

// Display 5-day forecast
function displayForecast(data) {
    forecast.innerHTML = "";

    const dailyData = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyData.forEach(item => {
        const date = new Date(item.dt_txt);

        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${date.toLocaleDateString("en-US", {
                weekday: "short"
            })}</h3>
            <p>${item.weather[0].description}</p>
            <h2>${Math.round(item.main.temp)}°C</h2>
            <p>Humidity: ${item.main.humidity}%</p>
        `;

        forecast.appendChild(card);
    });
}

// Search button
form.addEventListener("submit", function(e) {
    e.preventDefault();

    clearTimeout(debounceTimer);

    const city = cityInput.value.trim();

    if (city) {
        getWeather(city);
    }
});

// Debounced search
cityInput.addEventListener("input", function() {
    clearTimeout(debounceTimer);

    const city = cityInput.value.trim();

    if (city.length >= 2) {
        debounceTimer = setTimeout(() => {
            getWeather(city);
        }, 500);
    }
});

// Get favorites from localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Save favorites
function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Display favorites
function displayFavorites() {
    favoritesDiv.innerHTML = "";

    favorites.forEach(city => {
        const item = document.createElement("div");
        item.className = "favorite-item";

        const name = document.createElement("span");
        name.textContent = city;

        const searchBtn = document.createElement("button");
        searchBtn.textContent = "View";

        searchBtn.addEventListener("click", function() {
            cityInput.value = city;
            getWeather(city);
        });

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", function() {
            favorites = favorites.filter(item => item !== city);

            saveFavorites();
            displayFavorites();
        });

        item.append(name, searchBtn, removeBtn);
        favoritesDiv.appendChild(item);
    });
}

// Add city to favorites
addFavorite.addEventListener("click", function() {
    if (currentCity && !favorites.includes(currentCity)) {
        favorites.push(currentCity);

        saveFavorites();
        displayFavorites();
    }
});

// Dark / Light theme
themeBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "☀️ Light Mode";
    } else {
        themeBtn.textContent = "🌙 Dark Mode";
    }
});

// Load favorites when page opens
displayFavorites();

// Initially hide weather card
currentWeather.style.display = "none";
