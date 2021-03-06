$(function () {

    //declaration of variables
    const listofCities = $(".listOfCities");
    const mainCity = $("h3.searchedCity");
    const tempSection = $(".temp");
    const humiditySection = $(".humidity");
    const windSpeedSection = $(".windSpeed");
    const uvIndexSection = $(".uvIndex");

    let namesCity = [];
    let blank = "";

    let cityName = "";
    let icon = "";
    let temp = "";
    let humidity = "";
    let windSpeed = "";
    let uv = "";

    let uvColor = "";
    let todaysDate = moment().format("L");

    //Populates list of most recent cities in local storage on screen
    getCitiesLocalStorage();

    //When the search button is clicked, call from APIs 
    $(".searchBtn").on("click", function (event) {
        event.preventDefault();
        let cityName = $("#inputCity").val();

        ajaxCalls(cityName, function () {
            ajaxCalls(cityName);
            addCitiesLS(cityName);
            //Populates list of most recent cities in local storage on screen
            $("ul.listOfCities").clear();
            getCitiesLocalStorage();
        });

    });

    //This button clears local storage
    $(".clearBtn").on("click", function () {
        localStorage.clear();
    });

    // when city in list clicked, populate most recent search on screen
    $("button.buttonCity").on("click", function (event) {
        event.preventDefault();
        cityName = $(this).text();
        ajaxCalls(cityName);
        mainCity.html(`${cityName} &nbsp (${todaysDate})`);
    });

    function ajaxCalls(city, callBack) {
        blank = "";

        // cityState = $("#inputState").val();

        // clears text in input spot when search button is clicked
        $("#inputCity").val(blank);

        let currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=25d3fdfe342a19e8d55725db62d19795`;

        $.ajax({
            url: currentWeatherURL,
            method: "GET"
        })
            .then(function (response) {
                console.log(response);
                let lat = response.coord.lat;
                let lon = response.coord.lon;

                if (callBack) {
                    callBack();
                }

                //gets temperature
                temp = response.main.temp;
                temp = Math.floor((temp - 273.15) * 9 / 5 + 32);
                temp = `${temp}`;
                tempSection.html(temp);

                //gets humidity
                humidity = response.main.humidity;
                humidity = `${humidity} %`;
                humiditySection.html(humidity);

                //gets Wind Speed
                windSpeed = response.wind.speed;
                windSpeed = `${windSpeed} mph`;
                windSpeedSection.html(windSpeed);

                //gets weather icon
                icon = response.weather[0].icon;
                $(".iconWeather").attr("src", `http://openweathermap.org/img/wn/${icon}.png`).attr("alt", response.weather[0].description);

                // for the UV API
                let uvURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&
                exclude=&appid=25d3fdfe342a19e8d55725db62d19795`;
                // `https://api.openweathermap.org/data/2.5/uvi?appid=25d3fdfe342a19e8d55725db62d19795&lat=${lat}&lon=${lon}`;
                $.ajax({
                    url: uvURL,
                    method: "GET"
                })
                    .then(function (response) {
                        console.log(response);

                        //gets UV index and color
                        uv = response.current.uvi;
                        uvColor = uviColors(uv);
                        uvIndexSection.html(uv);
                        uvIndexSection.attr("style", `background-color: ${uvColor};`);

                        //adding 5 day forecast to screen
                        for (let i = 1; i < 6; i++) {
                            $(`span.date${i}`).text(moment().add(i - 1, 'd').format('l'));
                            let icon5 = response.daily[i - 1].weather[0].icon;
                            let description5 = response.daily[i - 1].weather[0].description;
                            $(`img.icon${i}`).attr('src', `http://openweathermap.org/img/wn/${icon5}.png`).attr("alt", description5);
                            let temp5 = response.daily[i - 1].temp.day;
                            $(`span.temperature${i}`).text(Math.round((temp5 - 273.15) * 9 / 5 + 32));
                            let humidity5 = response.daily[i - 1].humidity
                            $(`span.humidity${i}`).text(humidity5);
                        }

                    });
                //adds most recent city name and today's date to the dashboard
                mainCity.html(`${city} &nbsp (${todaysDate})`);
                //adds list item to unordered list and adds city names to screen
            })
        };

    // add cities to page
    function addCitiesLS(citySearch) {

                    // adding to local storage, taking key to get items
                    namesCity = localStorage.getItem("cityNames");
                    // taking string from local storage and putting back in original form
                    namesCity = JSON.parse(namesCity) || [];
                    namesCity.push(citySearch);
                    // setting item from array to local storage
                    localStorage.setItem("cityNames", JSON.stringify(namesCity));

                    //adds list item to unordered list and adds city names to screen
                    let listItem = $("<li class='cityNameinList'>");
                    //adds data-info attribute
                    let buttonItem = $(`<button class='buttonCity ${citySearch}'>`);
                    

                        //adds most recent city name and today's date to the dashboard
                        mainCity.html(`${citySearch} &nbsp (${todaysDate})`);
                   
                        listofCities.append(listItem);
                        listItem.append(buttonItem);
                        buttonItem.html(citySearch);
                }

    //sets background color for uv
    function uviColors(uv) {
                    if (uv < 3) {
                        return "green";
                    }
                    else if (uv >= 3 && uv < 6) {
                        return "yellow";
                    }
                    else if (uv >= 6 && uv < 8) {
                        return "orange";
                    }
                    else if (uv >= 8 && uv <= 10) {
                        return "red"
                    }
                    else return "purple";
                }

    //Gets most recent searches from local storage and shows on screen
    function getCitiesLocalStorage() {
                    let infoArray = [];
                    infoArray = JSON.parse(localStorage.getItem("cityNames"));
                    if (infoArray !== null) {

                        for (let i = 0; i < infoArray.length; i++) {
                            let listItem = $("<li class='cityNameinList'>");
                            //adds data-info attribute
                            let buttonItem = $("<button class='buttonCity'>");
                            listofCities.append(listItem);
                            listItem.append(buttonItem);
                            buttonItem.html(infoArray[i]);
                           
                        }
                        if (infoArray[0]) {
                            cityName = infoArray[infoArray.length - 1];
                            ajaxCalls(infoArray[infoArray.length - 1]);
                            mainCity.html(`${cityName} &nbsp (${todaysDate})`);
                        }

                    }

                    if (!infoArray) {
                        cityName = "Boston";
                        ajaxCalls("Boston");
                        mainCity.html(`${cityName} &nbsp (${todaysDate})`);
                    }

                }

});