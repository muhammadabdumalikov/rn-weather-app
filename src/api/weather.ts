import axios from 'axios';
import { apiKey } from '../constants';

const forecastEndpoint = (params) => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}`;
const locationsEndpoint = (params) => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

async function apiCall(endpoint){
  const option = {
    method: "GET",
    url: endpoint
  }

  try {
    const response = await axios.request(option);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function fetchWeatherForecast(params) {  
  let forecastUrl = forecastEndpoint(params);
  console.log(forecastUrl);
  
  return apiCall(forecastUrl);
}

export function fetchLocationForecast(params) {
  let locationUrl = locationsEndpoint(params);
  return apiCall(locationUrl);
}

