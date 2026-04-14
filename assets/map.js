/* ============================================
   CDEK Map — Delivery Points
   ============================================ */

(function () {
    var map, clusterer;
    var PVZ_DATA = null;   // { cityCode: [[code,address,worktime,phone,lng,lat], ...] }
    var CITY_INDEX = null; // { nameLower: cityCode }

    // Build a name->code index from CITIES (loaded via assets/cities.js).
    // Same-name cities disambiguated by region collapse into their first
    // occurrence here (which is also the highest-PVZ-count match thanks to
    // the ordering in cities.js).
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
                loadCity('Москва');
            })
            .catch(function () {
                showError('Не удалось загрузить базу ПВЗ. Перезагрузите страницу.');
            });
    });

    document.getElementById('city-search-btn').addEventListener('click', function () {
        var city = document.getElementById('city-input').value.trim();
        if (city) loadCity(city);
    });

    document.getElementById('city-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            var city = this.value.trim();
            if (city) loadCity(city);
        }
    });

    // Find PVZ list for a city. We try several spellings of the typed
    // string against CITY_INDEX before giving up — handles "Москва",
    // "москва", "Москва (Москва)" etc.
    function lookupOffices(city) {
        if (!CITY_INDEX || !PVZ_DATA) return null;
        var key = city.toLowerCase();
        var code = CITY_INDEX[key];
        if (!code) {
            // Try matching against the bare prefix of any indexed label
            // (e.g. user types "Москва" but the only entry is
            // "Москва (Татарстан)").
            var keys = Object.keys(CITY_INDEX);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].split(' (')[0] === key) {
                    code = CITY_INDEX[keys[i]];
                    break;
                }
            }
        }
        if (!code) return null;
        return PVZ_DATA[String(code)] || null;
    }

    function loadCity(city) {
        showLoader();
        var offices = lookupOffices(city);
        if (!offices || !offices.length) {
            hideLoader();
            showError('В городе «' + city + '» пока нет пунктов выдачи.');
            return;
        }
        clearError();
        displayOffices(offices);
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

        if (placemarks.length === 1) {
            map.setCenter(placemarks[0].geometry.getCoordinates(), 14, { duration: 300 });
        } else {
            try {
                map.setBounds(clusterer.getBounds(), {
                    checkZoomRange: true,
                    zoomMargin: 40,
                });
            } catch (e) {
                map.setCenter(placemarks[0].geometry.getCoordinates(), 12);
            }
        }
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

    // Inline status message under the search bar.
    function showError(msg) {
        var el = document.getElementById('map-status');
        if (!el) {
            el = document.createElement('div');
            el.id = 'map-status';
            el.className = 'map-status';
            var search = document.querySelector('.map-search-row');
            if (search && search.parentNode) {
                search.parentNode.insertBefore(el, search.nextSibling);
            }
        }
        el.textContent = msg;
        el.style.display = 'block';
    }
    function clearError() {
        var el = document.getElementById('map-status');
        if (el) el.style.display = 'none';
    }
})();
