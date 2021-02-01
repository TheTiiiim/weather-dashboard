$(function () {
	let $cityList = $(".cityList");
	let key = "cf96a97db48bd4eab6288cbdfae18c73";
	populateCities();
	multidaySearch("manchester").then(function (data) {
		// let temperature = data.main.temp;
		// let humidity = data.main.humidity;
		// let windSpeed = data.wind.speed;
		// let UVIndex;

		let multidayForecast = []

		for (let i = 0; i < 5; i++) {
			let forecast = data.list[i * 8];
			let simpleForecast = {};

			simpleForecast.date = forecast.dt_txt.slice(0, 10);
			simpleForecast.iconID = forecast.weather[0].id;
			simpleForecast.temp = forecast.main.temp;
			simpleForecast.humidity = forecast.main.humidity;


			multidayForecast.push(simpleForecast);
		}

		// let iconID;
		// imageURL = `http://openweathermap.org/img/wn/${iconID}@4x.png`;

		// display multiday forecast


	});

	function multidaySearch(city) {
		let multidaystring = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=imperial`;
		return $.get(multidaystring);
	}

	$(".citySearch").on("submit", function (e) {
		e.preventDefault();
		let cityName = $(this).serializeArray()[0].value;

		$("#citySearchBox").val("");

		// add city to list
		populateCities(cityName);
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

		// if a city number has been provided, remove it from the array
		if (typeof modCity === "number" && modCity >= 0 && modCity < citiesArray.length) citiesArray.splice(modCity, 1);

		$cityList.empty();
		$cityList.css("display", "none");

		if (!(citiesArray.length === 0)) {

			$cityList.css("display", "block");

			// populate city list
			citiesArray.forEach((city, index) => {
				$cityList.append(
					$("<li>").attr("tabindex", -1)
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
