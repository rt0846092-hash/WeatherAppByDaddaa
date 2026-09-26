/* Format a timestamp in the city's own timezone */
const cityTime = (timestamp, timezone, options) =>
  new Date((timestamp + timezone) * 1000).toLocaleString("en-US", { timeZone: "UTC", ...options });

const WeatherData = ({ getWeatherIcon, currentWeather, tempUnit, windUnit, unit }) => {
  if (!currentWeather?.sys) return null;

  const { name, sys, timezone, dt, main, wind, weather, visibility } = currentWeather;
  const time = (ts) => cityTime(ts, timezone, { hour: "2-digit", minute: "2-digit", hour12: false });
  const visibilityText =
    visibility == null
      ? "—"
      : unit === "metric"
        ? `${(visibility / 1000).toFixed(1)} km`
        : `${(visibility / 1609).toFixed(1)} mi`;

  const details = [
    { label: "Feels like", value: `${Math.round(main.feels_like)}${tempUnit}` },
    { label: "Humidity", value: `${main.humidity}%` },
    { label: "Wind", value: `${wind.speed.toFixed(1)} ${windUnit}` },
    { label: "Pressure", value: `${main.pressure} hPa` },
    { label: "Visibility", value: visibilityText },
    { label: "Sunrise / Sunset", value: `${time(sys.sunrise)} / ${time(sys.sunset)}` },
  ];

  return (
    <section className="weatherSection" aria-label={`Current weather in ${name}`}>
      <h2>{name}, {sys.country}</h2>
      <p>
        📅 {cityTime(dt, timezone, { weekday: "long", month: "short", day: "numeric" })} • 🕐 {time(dt)} local time
      </p>
      <img src={getWeatherIcon(weather[0].icon)} alt={weather[0].description} width="100" height="100" />
      <p>{Math.round(main.temp)}{tempUnit}</p>
      <p>{weather[0].description}</p>
      <p className="high-low">H: {Math.round(main.temp_max)}{tempUnit} · L: {Math.round(main.temp_min)}{tempUnit}</p>
      <div className="weather-cards">
        {details.map((d) => (
          <p key={d.label}>
            <span className="detail-label">{d.label}</span>
            <strong className="detail-value">{d.value}</strong>
          </p>
        ))}
      </div>
    </section>
  );
};

export default WeatherData;
