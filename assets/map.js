/* ============================================
   CDEK Map — Delivery Points
   ============================================ */

(function () {
    var map, clusterer;
    var currentCity = 'Москва';
    var PVZ_DATA = null;   // { cityCode: [[code,address,worktime,phone,lng,lat], ...] }
    var CITY_INDEX = null; // { nameLower: cityCode }

    // Build a name->code index from CITIES (loaded via assets/cities.js).
    // Same-name cities disambiguated by region collapse into their first
    // occurrence here; autocomplete still exposes every variant.
    function buildCityIndex() {
        CITY_INDEX = {};
        if (typeof CITIES === 'undefined') return;
        for (var i = 0; i < CITIES.length; i++) {
            var label = CITIES[i][0];
            var code = CITIES[i][1];
            var bare = label.replace(/\s*\(.*\)\s*$/, '').toLowerCase();
            if (!(bare in CITY_INDEX)) CITY_INDEX[bare] = code;
            if (!(label.toLowerCase() in CITY_INDEX)) CITY_INDEX[label.toLowerCase()] = code;
        }
    }

    function loadPvzData() {
        return fetch('./assets/pvz.json', { cache: 'force-cache' })
            .then(function (r) {
                if (!r.ok) throw new Error('pvz.json ' + r.status);
                return r.json();
            })
            .then(function (data) {
                PVZ_DATA = data;
            });
    }

    ymaps.ready(function () {
        map = new ymaps.Map('cdek-map', {
            center: [55.751574, 37.573856],
            zoom: 11,
            controls: ['zoomControl', 'geolocationControl'],
        });
        map.behaviors.enable('scrollZoom');

        clusterer = new ymaps.Clusterer({
            preset: 'islands#greenClusterIcons',
            clusterDisableClickZoom: false,
            clusterOpenBalloonOnClick: true,
            geoObjectOpenBalloonOnClick: true,
        });
        map.geoObjects.add(clusterer);

        buildCityIndex();
        loadPvzData()
            .then(function () {
                loadCity(currentCity);
            })
            .catch(function () {
                // PVZ data failed to load — still show map centered on
                // Moscow with the Yandex fallback.
                loadCity(currentCity);
            });
    });

    document.getElementById('city-search-btn').addEventListener('click', function () {
        var city = document.getElementById('city-input').value.trim();
        if (city) loadCity(city);
    });

    document.getElementById('city-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var city = this.value.trim();
            if (city) loadCity(city);
        }
    });

    function loadCity(city) {
        currentCity = city;
        showLoader();

        ymaps
            .geocode(city, { results: 1 })
            .then(function (res) {
                var first = res.geoObjects.get(0);
                if (!first) {
                    hideLoader();
                    alert('Город не найден. Попробуйте другой запрос.');
                    return;
                }
                var coords = first.geometry.getCoordinates();
                map.setCenter(coords, 12, { duration: 300 });

                var code = CITY_INDEX ? CITY_INDEX[city.toLowerCase()] : null;
                var offices = code && PVZ_DATA ? PVZ_DATA[String(code)] : null;

                if (offices && offices.length) {
                    displayOffices(offices);
                } else {
                    searchYandex();
                }
            })
            .catch(function () {
                hideLoader();
                alert('Город не найден. Попробуйте другой запрос.');
            });
    }

    function displayOffices(offices) {
        clusterer.removeAll();
        var placemarks = [];
        for (var i = 0; i < offices.length; i++) {
            var o = offices[i]; // [code, address, worktime, phone, lng, lat]
            placemarks.push(
                createPlacemark(
                    [o[5], o[4]],
                    o[0] || 'ПВЗ СДЭК',
                    o[1],
                    o[2],
                    o[3],
                ),
            );
        }
        clusterer.add(placemarks);
        hideLoader();

        if (placemarks.length === 0) searchYandex();
        else if (placemarks.length === 1) {
            map.setCenter(placemarks[0].geometry.getCoordinates(), 14, { duration: 300 });
        } else {
            map.setBounds(clusterer.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
        }
    }

    function searchYandex() {
        ymaps
            .geocode('СДЭК ' + currentCity, { results: 50 })
            .then(function (res) {
                clusterer.removeAll();
                var placemarks = [];
                var len = res.geoObjects.getLength();
                for (var i = 0; i < len; i++) {
                    var obj = res.geoObjects.get(i);
                    var coords = obj.geometry.getCoordinates();
                    var name = obj.properties.get('name') || 'ПВЗ СДЭК';
                    var addr = obj.properties.get('description') || '';
                    placemarks.push(createPlacemark(coords, name, addr, '', ''));
                }
                clusterer.add(placemarks);
                hideLoader();
            })
            .catch(hideLoader);
    }

    function createPlacemark(coords, name, address, hours, phone) {
        var body =
            '<div class="pvz-info">' +
            '<b>' + escHtml(name) + '</b>' +
            (address ? '<div class="pvz-addr">' + escHtml(address) + '</div>' : '') +
            (hours ? '<div class="pvz-hours">' + escHtml(hours) + '</div>' : '') +
            (phone ? '<div class="pvz-phone">' + escHtml(phone) + '</div>' : '') +
            '</div>';

        return new ymaps.Placemark(
            coords,
            { balloonContentHeader: '', balloonContentBody: body },
            { preset: 'islands#greenDotIcon' },
        );
    }

    function escHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function showLoader() {
        var el = document.getElementById('map-loading');
        if (el) el.style.display = 'block';
    }
    function hideLoader() {
        var el = document.getElementById('map-loading');
        if (el) el.style.display = 'none';
    }
})();
