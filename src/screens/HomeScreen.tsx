import { StatusBar } from "expo-status-bar";
import { View, Image, SafeAreaView, TextInput, TouchableOpacity, Text, ScrollView } from "react-native";
import { theme } from "../theme";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline"
import {CalendarDaysIcon, MapPinIcon} from "react-native-heroicons/solid"
import { useCallback, useEffect, useState } from "react";
import { debounce } from 'lodash';
import { fetchLocationForecast, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from 'react-native-progress'
import { getData, storeData } from "../utils/asynStoreage";

export function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const handleLoc = (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc?.name,
      days: '7'
    }).then(data => {
      setWeather(data); 
      setLoading(false);
      storeData('city', loc?.name)
    })
  }

  const handleSearch = (value: string) => {
    if (value.length > 2) {
      fetchLocationForecast({ cityName: value }).then(data => {
        setLocations(data)
    });
    }    
  }

  useEffect(() => {
    fetchMyWeatherDate();
  }, [])

  async function fetchMyWeatherDate() {
    const myCity = await getData('city') as string;
    let cityName = 'Tashkent';

    if(myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName: 'Tashkent',
      days: '7'
    }).then(data => {
      setWeather(data);      
      setLoading(false);
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  const { current, location } = weather as any;

  return (
    <View className="flex-1 relative">
      <StatusBar style="dark"/>
      <Image blurRadius={70} source={require('../../assets/images/bg.png')} className="absolute h-full w-full" />
      {loading ? (<View className="flex-1 flex-row justify-center items-center">
        <Progress.CircleSnail thickness={10} size={140} color="#0bb32b"/>
      </View>) : 
        (<SafeAreaView className="flex flex-1">
      <View className="mx-4 relative z-50" style={{ height: "7%" }}>
        <View className="flex-1 flex-row justify-end items-center rounded-full" style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : "transparent" }}>
          {
            showSearch ? (<TextInput onChangeText={handleTextDebounce} placeholder="Search city" placeholderTextColor={'lightgray'} className="pl-6 flex-1 text-base text-white" />) : null
          }
          <TouchableOpacity onPress={() => toggleSearch(!showSearch)} className="rounded-full p-3 m-1" style={{ backgroundColor: theme.bgWhite(0.3) }} >
            <MagnifyingGlassIcon size="25" color="white"/>
          </TouchableOpacity>
        </View>
        {
          locations.length > 0 && showSearch ? (
            <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
              {locations.map((loc: any, index) => {
                let showBorder = index + 1 != locations.length;
                let borderClass = showBorder ? "border-b-2 border-b-gray-400" : "";
                
                return (
                  <TouchableOpacity onPress={()=>{handleLoc(loc)}} key={index} className={"flex-row items-center border-0 p-3 px-4 mb-1" + borderClass}>
                    <MapPinIcon size={20} color="gray"/>
                    <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>) : null
        }
      </View>
      <View className="mx-4 flex justify-around flex-1 mb-2">
        {/* location */}
        <Text className="text-white text-center text-2xl font-bold ">{location?.name},
          <Text className="text-lg font-semibold text-gray-300"> {location?.country}</Text>
        </Text>
        {/* weather image */}
        <View className="flex-row justify-center">
            <Image source={weatherImages[current?.condition.text]} className="h-52 w-52"/>
        </View>
        {/* degreee celcius */}
        <View className="space-y-2">
          <Text className="text-center font-bold text-white text-6xl ml-5">{current?.temp_c}&#176;</Text>
          <Text className="text-center text-white text-xl ml-5 tracking-widest">{current?.condition.text}</Text>
        </View>
        {/* other stats */}
        <View className="flex-row justify-between mx-4">
          <View className="flex-row space-x-2 items-center">
            <Image source={require('../../assets/icons/wind.png')} className="h-6 w-6"/>
            <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
          </View>

          <View className="flex-row space-x-2 items-center">
            <Image source={require('../../assets/icons/drop.png')} className="h-6 w-6"/>
            <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
          </View>

          <View className="flex-row space-x-2 items-center">
            <Image source={require('../../assets/icons/sun.png')} className="h-6 w-6"/>
                <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0].astro?.sunrise}</Text>
          </View>
        </View>
      </View>

      {/* forecast next day */}
      <View className="mb-2 space-y-3">
        <View className="flex-row items-center mx-5 space-x-2">
          <CalendarDaysIcon size={22} color="white" />
          <Text className="text-white text-base">Daily forecats</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 15 }} horizontal showsHorizontalScrollIndicator={false}>
          {weather?.forecast?.forecastday.map((item, index) => {
            let date = new Date(item?.date);

            let options = { weekday: "long" };
            let dayName = date.toLocaleDateString('en-US', options);            
            dayName = dayName.split(',')[0];
            
            return (<View
              className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4" 
              key={index}
              style={{ backgroundColor: theme.bgWhite(0.15) }}>
              <Image source={weatherImages[item?.day?.condition?.text]} className="h-11 w-11" />
              <Text className="text-white">{dayName}</Text>
              <Text className="text-white font-semibold text-xl">{item?.day.avgtemp_c}&#176;</Text>
            </View>)
          })
          }
        </ScrollView>
      </View>
    </SafeAreaView>)
      }
    </View>)
}