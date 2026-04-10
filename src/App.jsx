import {useState, useEffect} from "react";
import SearchForm from "./components/SearchForm";
import WeatherData from "./components/weatherData";
import ForecastData from "./components/forecastData";
import "./App.css";

const App = () => {
  const [city,setCity] = useState("Seoul");
  const [unit,setUnit] = useState('metric');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);

  
  const API_KEY = '1e378df8b9185de0ccd1df611ee3777f';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  
   useEffect(() => {
  const fectchWeatherData = async () => {
    setLoading(true);
    setError('');

    try {
      const weatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          throw new Error('❌ Invalid API key!');
        }
        if (weatherResponse.status === 404) {
          throw new Error(`City "${city}" not found.`);
        }
        const errorData = await weatherResponse.json();
        throw new Error(errorData.message || "Failed to fetch weather data");
      }

      const weather = await weatherResponse.json();
      setCurrentWeather(weather);

      const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`;
      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast");
      }

      const currForecast = await forecastResponse.json();
      const dailyForecast = currForecast.list.filter(item =>
        item.dt_txt.includes('12:00:00')
      );

      setForecast(dailyForecast.slice(0, 5));
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setCurrentWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  if (city) {
    fectchWeatherData();
  }
}, [city, unit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(searchInput.trim()){
      setCity(searchInput.trim());
      setSearchInput('');
    }
  }

 const getWeatherIcon = (iconCode) => 
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

const formateDate = (timeStamp, timezone) => {
  const localDate = new Date((timeStamp + timezone) * 1000);
  return localDate.toUTCString().split(',')[0];
};
 
const formateTime = (timeStamp, timezone) => {
  const localTime = new Date((timeStamp + timezone) * 1000);
  return localTime.toUTCString().match(/(\d{2}:\d{2})/)[0];
};

 const toggleUnit = () => { setUnit(unit === 'metric' ? 'imperial' : 'metric') };
 const getTemperatureUnit = () => unit === 'metric' ? 'C°' : 'F°';
const getWindSpeed = () => unit === 'metric' ? 'm/s' : 'mph';

 return(
  <div className = "App">
    <div className = "container">
      <header className = "head">
        <h1>🌤️ Weather App</h1>
        <button onClick = {toggleUnit} className = "unitChangeBtn">
          {unit === 'metric'? "🌡️ switch to F°" : '🌡️ switch to C°'}
        </button>
      </header>

      <SearchForm searchInput = {searchInput}  setSearchInput = {setSearchInput} handleSubmit = {handleSubmit}/>

      {loading &&
      <div><p>Loading weather of {city}...</p></div> } 
      {error && (<div className = "error"> 
        <p>❌ {error}</p></div>)}
     
     {!loading && currentWeather && 
     <WeatherData 
       getWeatherIcon = {getWeatherIcon}
       getTemperatureUnit = {getTemperatureUnit}
       getWindSpeed = {getWindSpeed}
       currentWeather = {currentWeather}
      formateDate = {formateDate}
      formateTime = {formateTime}
       unit = {unit}
     />}
      {!loading && forecast && <ForecastData 
      getWeatherIcon = {getWeatherIcon}
      forecast = {forecast}
      />}
    </div>
  </div>
 )
 }

 export default App;