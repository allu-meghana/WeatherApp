import React, { useEffect, useRef, useState } from 'react';
import './Weather.css';

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bgClass, setBgClass] = useState('default');

  const apiKey = import.meta.env.VITE_APP_ID;

  const fetchWeather = async (query, isCoords = false) => {
    if (!apiKey) {
      console.error("API key is missing");
      setError("API key missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isCoords
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${apiKey}&units=metric`
        : `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch");

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed.toFixed(2),
        temperature: Math.round(data.main.temp),
        location: data.name,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
        description: data.weather[0].description
      });

      const main = data.weather[0].main.toLowerCase();
      if (main.includes("clear")) setBgClass("sunny");
      else if (main.includes("rain")) setBgClass("rainy");
      else if (main.includes("cloud")) setBgClass("cloudy");
      else if (main.includes("snow")) setBgClass("snowy");
      else setBgClass("default");

    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const value = inputRef.current.value.trim();
    if (value !== '') fetchWeather(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }, true);
      },
      () => {
        console.warn("Location not allowed, loading default city.");
        fetchWeather("New York");
      }
    );
  }, []);

  return (
    <div className={`weather ${bgClass}`}>
      <div className='search-bar'>
        <input
          ref={inputRef}
          type="text"
          placeholder='Search city...'
          onKeyDown={handleKeyDown}
        />
        <i className='bx bx-search' onClick={handleSearch}></i>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : error ? (
        <p className='error'>{error}</p>
      ) : weatherData ? (
        <>
          <img src={weatherData.icon} alt="weather icon" className='weather-icon' />
          <p className='temperature'>{weatherData.temperature}°C</p>
          <p className='location'>{weatherData.location}</p>
          <p className='description'>
            {weatherData.description?.includes('cloud') && '☁️ '}
            {weatherData.description?.includes('rain') && '🌧️ '}
            {weatherData.description?.includes('clear') && '☀️ '}
            {weatherData.description?.includes('snow') && '❄️ '}
            {weatherData.description}
          </p>
          <hr className="weather-divider" />
          <div className="weather-data">
            <div className="col">
              <p>{weatherData.humidity}%</p>
              <span>Humidity</span>
            </div>
            <div className="col">
              <p>{weatherData.windSpeed} km/h</p>
              <span>Wind Speed</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Weather;
