let map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

const locateBtn = document.querySelector("#locateBtn");
const neighborList = document.querySelector("#neighborList");

const findLocation = () => {
    locateBtn.disabled = true;
    locateBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Locating...';
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
            // 1. Update Map
            map.setView([lat, lon], 6);
            L.marker([lat, lon]).addTo(map)
                .bindPopup('You are here!').openPopup();
            geoCodeAPI(lat, lon)
        } catch (error) {
            console.log("Error =>", error)

        }
    });
}

const geoCodeAPI = (lat, lon) => {
    const geoCodeApi = fetch(`https://geocode.xyz/${lat},${lon}?geoit=json&auth=525942942072341987621x26489`)
    geoCodeApi.then((data) => data.json()).then((result) => {
        restCountriesAPI(result)
    }).catch((error) => {
        console.log(error)
    }).finally(() => {
        locateBtn.disabled = false;
        locateBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Find Me';
    })
}

const restCountriesAPI = (ObjCountryWithCity) => {
    const { city, country } = ObjCountryWithCity;
    const countriesAPI = fetch(`https://restcountries.com/v3.1/name/${country}`)
    countriesAPI.then(data => data.json()).then(result => {
        updateUI(result, city, country)
    }).catch(error => {
        console.log(error)
    })
}

const updateUI = (countryObj, city, country) => {
    document.querySelector('#welcomeState').classList.add("hidden")
    document.querySelector('#dataState').classList.remove("hidden")
    const { area, borders, capital, continents, currencies, flags: { png }, languages, maps, population, timezones, car } = countryObj[0];

    document.querySelector('#mainFlag').src = png;
    document.querySelector('#cityName').innerText = city;
    document.querySelector('#countryName').innerText = country;
    document.querySelector('#currency').innerText = Object.keys(currencies)[0];
    document.querySelector('#timezone').innerText = timezones[0];
    document.querySelector('#population').innerText = (population / 1000000).toFixed(1) + "M";
    document.querySelector('#capital').innerText = capital[0];
    document.querySelector('#language').innerText = Object.values(languages);
    document.querySelector('#continents').innerText = continents[0];
    document.querySelector('#driving').innerText = car.side;
    document.querySelector('#area').innerText = area + "km²";

    if (borders && borders.length > 0) {
        neighborList.innerHTML = ""
        borders.forEach(neighbor => {
            fetch(`https://restcountries.com/v3.1/alpha/${neighbor}`)
                .then(data => data.json())
                .then(result => {
                    const { name: { common }, capital, flags: { png }, population } = result[0];
                    const div = document.createElement('div');
                    div.className = "flex items-center justify-between p-4 bg-slate-50 rounded-2xl ";
                    div.innerHTML = `
                        <div class="flex items-center gap-3">
                            <span class="w-16 h-12 overflow-hidden border-2 border-slate-100 flex-shrink-0 shadow-inner">
                                <img id="mainFlag" src='${png}'alt="Flag" class="w-full h-full object-contain">
                            </span>
                            <div>
                                <p class="font-bold text-slate-800 group-hover:text-indigo-600">${common}</p>
                                <p class="text-[10px] text-slate-400 uppercase tracking-tighter">${capital}</p>
                            </div>
                        </div>
                    `;
                    neighborList.appendChild(div)
                })
        });
    } else {
        neighborList.innerHTML = `
            <div class="text-center py-10 text-slate-400">
                <i class="fa-solid fa-anchor text-4xl mb-3 block opacity-20"></i>
                <p class="text-sm">This is an island nation with no land borders.</p>
            </div>`;
    }
}
locateBtn.addEventListener("click", findLocation)