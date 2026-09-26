import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm";
import WeatherData from "./components/weatherData";
import ForecastData from "./components/forecastData";
import "./App.css";

// OpenWeather free-tier key. In a browser-only app any key is visible to visitors,
// so it can also be supplied through VITE_OPENWEATHER_API_KEY at build time.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "1e378df8b9185de0ccd1df611ee3777f";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const load = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
};

/* Shift a UTC timestamp by the city's offset so UTC getters return the city's local time */
const cityDate = (timestamp, timezone) => new Date((timestamp + timezone) * 1000);

/* Turn the 3-hour forecast into one entry per day with the real high and low */
const toDailyForecast = (data) => {
  const tz = data.city.timezone;
  const todayKey = cityDate(Date.now() / 1000, tz).toISOString().slice(0, 10);
  const days = new Map();

  for (const item of data.list) {
    const local = cityDate(item.dt, tz);
    const key = local.toISOString().slice(0, 10);
    if (key === todayKey) continue;

    const day = days.get(key) ?? { dt: item.dt, high: -Infinity, low: Infinity, middayItem: item, middayGap: Infinity };
    day.high = Math.max(day.high, item.main.temp_max);
    day.low = Math.min(day.low, item.main.temp_min);
    // Use the slot closest to 1 pm local time for the icon and description
    const gap = Math.abs(local.getUTCHours() - 13);
    if (gap < day.middayGap) {
      day.middayGap = gap;
      day.middayItem = item;
      day.dt = item.dt;
    }
    days.set(key, day);
  }

  return [...days.values()].slice(0, 5).map((d) => ({
    dt: d.dt,
    timezone: tz,
    high: d.high,
    low: d.low,
    weather: d.middayItem.weather[0],
  }));
};

const App = () => {
  // A query is either { city } or { lat, lon } (from "use my location")
  const [query, setQuery] = useState(() => ({ city: load("lastCity", "Seoul") }));
  const [unit, setUnit] = useState(() => load("unit", "metric"));
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const place = query.city
      ? `q=${encodeURIComponent(query.city)}`
      : `lat=${query.lat}&lon=${query.lon}`;
    const params = `${place}&units=${unit}&appid=${API_KEY}`;

    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      try {
        // Current weather and forecast load at the same time
        const [weatherRes, forecastRes] = await Promise.all([
          fetch(`${BASE_URL}/weather?${params}`, { signal: controller.signal }),
          fetch(`${BASE_URL}/forecast?${params}`, { signal: controller.signal }),
        ]);

        if (!weatherRes.ok) {
          if (weatherRes.status === 401) throw new Error("The weather service rejected the API key.");
          if (weatherRes.status === 404) throw new Error(`City "${query.city}" not found. Check the spelling and try again.`);
          const body = await weatherRes.json().catch(() => ({}));
          throw new Error(body.message || "Couldn't load the weather. Please try again.");
        }
        if (!forecastRes.ok) throw new Error("Couldn't load the forecast. Please try again.");

        const [weather, forecastData] = await Promise.all([weatherRes.json(), forecastRes.json()]);
        setCurrentWeather(weather);
        setForecast(toDailyForecast(forecastData));
        save("lastCity", weather.name);
      } catch (err) {
        if (err.name === "AbortError") return; // a newer search replaced this one
        setError(
          err instanceof TypeError
            ? "Can't reach the weather service. Check your internet connection."
            : err.message
        );
        setCurrentWeather(null);
        setForecast(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchWeather();
    return () => controller.abort();
  }, [query, unit]);

  // Tab title shows the current city and temperature
  useEffect(() => {
    document.title = currentWeather
      ? `${Math.round(currentWeather.main.temp)}${unit === "metric" ? "°C" : "°F"} ${currentWeather.name} · Weather App`
      : "Weather App — Live Weather & 5-Day Forecast";
  }, [currentWeather, unit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const city = searchInput.trim();
    if (city) {
      setQuery({ city });
      setSearchInput("");
    }
  };

  const [locating, setLocating] = useState(false);
  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location. Search for a city instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setQuery({ lat: coords.latitude.toFixed(4), lon: coords.longitude.toFixed(4) });
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Allow location access, or search for a city.");
      },
      { timeout: 10000 }
    );
  };

  const toggleUnit = () => {
    const next = unit === "metric" ? "imperial" : "metric";
    setUnit(next);
    save("unit", next);
  };

  const getWeatherIcon = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const tempUnit = unit === "metric" ? "°C" : "°F";
  const windUnit = unit === "metric" ? "m/s" : "mph";

  return (
    <div className="App">
      <main className="container">
        <header className="head">
          <h1>🌤️ Weather App</h1>
          <button onClick={toggleUnit} className="unitChangeBtn" aria-label={`Switch to ${unit === "metric" ? "Fahrenheit" : "Celsius"}`}>
            🌡️ Switch to {unit === "metric" ? "°F" : "°C"}
          </button>
        </header>

        <SearchForm
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSubmit={handleSubmit}
          onLocate={handleLocate}
          locating={locating}
        />

        {loading && (
          <div className="loading" role="status">
            <p>Loading weather{query.city ? ` for ${query.city}` : " for your location"}…</p>
          </div>
        )}

        {error && (
          <div className="error" role="alert">
            <p>❌ {error}</p>
          </div>
        )}

        {!loading && currentWeather && (
          <WeatherData
            getWeatherIcon={getWeatherIcon}
            currentWeather={currentWeather}
            tempUnit={tempUnit}
            windUnit={windUnit}
            unit={unit}
          />
        )}

        {!loading && forecast?.length > 0 && (
          <ForecastData getWeatherIcon={getWeatherIcon} forecast={forecast} tempUnit={tempUnit} />
        )}

        <footer className="app-footer">
          Data from <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeather</a> · Built by{" "}
          <a href="https://github.com/rt0846092-hash" target="_blank" rel="noopener noreferrer">Roshan Tamang</a>
        </footer>
      </main>
    </div>
  );
};

export default App;
