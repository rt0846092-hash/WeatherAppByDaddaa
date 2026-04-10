const ForecastData = ({getWeatherIcon,forecast}) => {
    return(
        <div className = "forcast">
            <h3>📊 5-Day Forecast</h3>
            <div className = "forcast-cards">
            {forecast.map((day,index) => (
                <div key = {index} className = "forcast-card">
                    <p>{new Date(day.dt*1000).toLocaleDateString('en-US',{weekday:'short'})}</p>
                    <img src = {getWeatherIcon(day.weather[0].icon)} 
                         alt = {day.weather[0].description} 
                         />
                    <p>🔥 {Math.round(day.main.temp_max)}/{Math.round(day.main.temp_min)}</p>
                </div>
            ))}
            </div>
        </div>
    )
}

export default ForecastData;