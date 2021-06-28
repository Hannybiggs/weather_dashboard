// needed APIKey; connects to all necessary query URLs
const APIKey = "fb854b8b1c2a83c58582ea6cbd734f54";


// Declaring all necessary variables
function initPage() {
    const cityInput = document.getElementById("city-input");
    const searchBtn = document.getElementById("search-button");
    const clearBtn = document.getElementById("clear-history");

    const cityNameElement = document.getElementById("city-name");
    const mainPicEl = document.getElementById("main-pic");
    const tempEl = document.getElementById("temperature");
    const humidityEl = document.getElementById("humidity");
    const windEl = document.getElementById("wind");
    const uvEl = document.getElementById("UV-index");
    const historyEl = document.getElementById("history");

    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];


// Event listeners 
searchBtn.addEventListener("click", function () {
    const searchTerm = cityInput.value;
    getWeather(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
})

clearBtn.addEventListener("click", function () {
    searchHistory = [];
    renderSearchHistory();
})


// Uses city name input to generate the needed URL based on the query and API key
function getWeather(cityName) {
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        axios.get(queryURL)
            .then(function (response) {
                const currentDate = new Date(response.data.dt * 1000);
                const day = currentDate.getDate();
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                cityNameElement.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
                let weatherPic = response.data.weather[0].icon;

                // generates image next to the city and date
                mainPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");


                // Sets all of the current weather conditions for the top section
                mainPicEl.setAttribute("alt", response.data.weather[0].description);
                tempEl.innerHTML = "Temperature: " + temptAdjust(response.data.main.temp) + " &#176F";
                humidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                windEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;

                // Sets images for UV badge next to text
                let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
                axios.get(UVQueryURL)
                    .then(function (response) {
                        let UVIndex = document.createElement("span");
                        UVIndex.setAttribute("class", "badge badge-danger");
                        UVIndex.innerHTML = response.data[0].value;
                        uvEl.innerHTML = "UV Index: ";
                        uvEl.append(UVIndex);
                    });


                //  Gives the 5-day forcast
                let cityID = response.data.id;
                let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        console.log(response);
                        const forecastEls = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            const forecastIndex = i * 8 + 4;
                            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            const forecastDay = forecastDate.getDate();
                            const forecastMonth = forecastDate.getMonth() + 1;
                            const forecastYear = forecastDate.getFullYear();
                            const forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);
                            const forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            const forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + temptAdjust(response.data.list[forecastIndex].main.temp) + " &#176F";
                            forecastEls[i].append(forecastTempEl);
                            const forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);
                        }
                    })
            });
    }


// Adjust the temperature reading so that it is Farenheit, not K
function temptAdjust(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
}


function renderSearchHistory() {
    historyEl.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function () {
            getWeather(historyItem.value);
        })
        historyEl.append(historyItem);
    }
}

renderSearchHistory();
if (searchHistory.length > 0) {
    getWeather(searchHistory[searchHistory.length - 1]);
}

}
initPage();