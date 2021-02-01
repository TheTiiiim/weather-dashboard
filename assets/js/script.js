$(function () {
	let $cityList = $(".cityList");
	let key = "cf96a97db48bd4eab6288cbdfae18c73";
	populateCities();

	function getWeatherIconSrc(id) {
		return `http://openweathermap.org/img/wn/${id}.png`;
	}

	function displayWeather(weatherData) {

		let multidayForecastArea = $("<div>").addClass("forecast row");

		for (let i = 0; i < weatherData.multiday.length; i++) {
			multidayForecastArea.append($("<div>")
				.addClass("summaryWeather col-xl-4 col-md-6 col-sm-12")
				.append($("<div>").addClass("summaryBorder")
					.append($("<h4>").text(weatherData.multiday[i].date))
					.append($("<p>")
						.append($("<img>")
							.attr("src", getWeatherIconSrc(weatherData.multiday[i].icon.id))
							.attr("alt", weatherData.multiday[i].icon.description)
						)
					)
					.append($("<p>")
						.text(`Temperature: ${weatherData.multiday[i].temp}`)
					)
					.append($("<p>")
						.text(`Humidity: ${weatherData.multiday[i].humidity}`)
					)
				)
			)
		}

		$(".forecastArea")
			.empty()
			.append($("<h2>").text(weatherData.city))
			.append($("<div>")
				.addClass("currentWeather")
				.append($("<p>")
					.text(`Temperature: ${weatherData.current.temp} ${String.fromCharCode(176)}F`)
				)
				.append($("<p>")
					.text(`Humidity: ${weatherData.current.humidity}%`)
				)
				.append($("<p>")
					.text(`Wind Speed: ${weatherData.current.windSpeed} MPH`)
				)
				.append($("<p>")
					.text(`UV Index: ${weatherData.current.uvi}`)
				)
			)
			.append($("<h3>").text("5 Day Forecast"))
			.append(multidayForecastArea)

	}

	function citySearch(city, callback) {
		multidaySearch(city).then(function (data) {
			// console.log(data);
			let multidayForecast = []

			for (let i = 0; i < 5; i++) {
				let forecast = data.list[i * 8];
				let simpleForecast = {};

				simpleForecast.date = forecast.dt_txt.slice(0, 10);
				simpleForecast.icon = {
					"id": forecast.weather[0].icon,
					"description": forecast.weather[0].description
				};
				simpleForecast.temp = forecast.main.temp;
				simpleForecast.humidity = forecast.main.humidity;


				multidayForecast.push(simpleForecast);
			}

			let coords = data.city.coord;

			onecallSearch(coords.lat, coords.lon).then(function (data) {
				let todayWeather = {};

				// temperature, hummidty, wind speed, uv index, icon id

				todayWeather.temp = data.current.temp;
				todayWeather.humidity = data.current.humidity;
				todayWeather.windSpeed = data.current.wind_speed;
				todayWeather.uvi = data.current.uvi;

				let weather = {
					"city": city,
					"current": todayWeather,
					"multiday": multidayForecast
				}
				callback(weather);
			});

		});
	}

	function multidaySearch(city) {
		let multidaystring = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=imperial`;
		return $.get(multidaystring);
	}

	function onecallSearch(lat, lon) {
		let onecallString = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${key}&units=imperial`;
		return $.get(onecallString);
	}

	$(".citySearch").on("submit", function (e) {
		e.preventDefault();
		let cityName = $(this).serializeArray()[0].value;

		$("#citySearchBox").val("");

		citySearch(cityName, function (data) {
			//display weather
			displayWeather(data);
			// add city to list
			populateCities(cityName);
		});

	});

	function populateCities(modCity = "") {
		// accepts a number or a string
		// if string, adds string to city list
		// if number, deletes string from city list at # position

		let citiesArray = JSON.parse(localStorage.getItem("searchedCities"));

		// if modcity is neither a string nor a number, dip
		if (!(typeof modCity === "string"
			|| typeof modCity === "number"))
			return;

		// if citiesArray isnt an array, make it one;
		if (!(Array.isArray(citiesArray))) citiesArray = [];

		// if a city string has been provided, add it to the array
		if (typeof modCity === "string" && !(modCity === "")) citiesArray.push(modCity);

		if (typeof modCity === "string" && modCity === "") citySearch(citiesArray[0], displayWeather);

		// if a city number has been provided, remove it from the array
		if (typeof modCity === "number" && modCity >= 0 && modCity < citiesArray.length) citiesArray.splice(modCity, 1);

		$cityList.empty();
		$cityList.css("display", "none");

		if (!(citiesArray.length === 0)) {

			$cityList.css("display", "block");

			// populate city list
			citiesArray.forEach((city, index) => {
				$cityList.append(
					$("<li>")
						.attr("tabindex", -1)

						// search city on click
						.on("click", function (e) {
							let city = $(this).children("div").text();

							citySearch(city, displayWeather);
						})

						// content
						.append(
							$("<div>").text(city)
						)

						// delete button
						.append(
							$("<button>")
								// click handler
								.on("click", function (e) {
									populateCities(parseInt($(this).attr("data-cityIndex")));
								})

								// metadata
								.addClass("deleteButton")
								.attr("data-cityIndex", index)
								.append(
									$("<i>").addClass("bi bi-x-circle")
								)
						)
				);
			});
		}

		localStorage.setItem("searchedCities", JSON.stringify(citiesArray));
	}
});
