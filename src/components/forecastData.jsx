const ForecastData = ({ getWeatherIcon, forecast, tempUnit }) => {
  return (
    <section className="forcast" aria-label="Forecast">
      <h3>📊 {forecast.length}-Day Forecast</h3>
      <div className="forcast-cards">
        {forecast.map((day) => (
          <div key={day.dt} className="forcast-card">
            <p>
              {new Date((day.dt + day.timezone) * 1000).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
            </p>
            <img src={getWeatherIcon(day.weather.icon)} alt={day.weather.description} title={day.weather.description} width="56" height="56" />
            <p>
              <span className="temp-high">{Math.round(day.high)}{tempUnit}</span>
              <span className="temp-low"> / {Math.round(day.low)}{tempUnit}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ForecastData;
