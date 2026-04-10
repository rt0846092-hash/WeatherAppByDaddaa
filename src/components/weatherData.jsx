const WeatherData = ({getWeatherIcon,getTemperatureUnit,getWindSpeed,currentWeather,formateDate,formateTime}) =>{
    if(!currentWeather || !currentWeather.sys) return null;
    
    return(
        <div className = "weatherSection">
         <h2>{currentWeather.name},{currentWeather.sys.country}</h2>     
            <p>
                📅{formateDate(currentWeather.dt, currentWeather.timezone)}
                • 🕐 {formateTime(currentWeather.dt, currentWeather.timezone)}
                </p>
            <img src = {getWeatherIcon(currentWeather.weather[0].icon)}
                 alt = {currentWeather.weather[0].description}/>
            <p>{Math.round(currentWeather.main.temp)} {getTemperatureUnit()}</p>
            <p>{currentWeather.weather[0].description}</p>
            <div className = "weather-cards">
                <p>Feels:{Math.round(currentWeather.main.feels_like)} {getTemperatureUnit()}</p>
                <p>Humidity: {currentWeather.main.humidity}%</p>
                <p>WindSpeed:{currentWeather.wind.speed}{getWindSpeed()}</p>
            </div>
         </div>
    )
}

export default WeatherData;