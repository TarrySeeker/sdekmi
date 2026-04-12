/* ============================================
   CDEK Map — Delivery Points
   ============================================ */

(function() {
    var map, clusterer, currentCity = 'Москва';

    ymaps.ready(function() {
        document.getElementById('map-loading').style.display = 'none';

        map = new ymaps.Map('cdek-map', {
            center: [55.751574, 37.573856],
            zoom: 11,
            controls: ['zoomControl', 'geolocationControl']
        });

        map.behaviors.enable('scrollZoom');

        clusterer = new ymaps.Clusterer({
            preset: 'islands#greenClusterIcons',
            clusterDisableClickZoom: false,
            clusterOpenBalloonOnClick: true,
            geoObjectOpenBalloonOnClick: true
        });

        map.geoObjects.add(clusterer);
        loadCity(currentCity);
    });

    // Search button
    document.getElementById('city-search-btn').addEventListener('click', function() {
        var city = document.getElementById('city-input').value.trim();
        if (city) loadCity(city);
    });

    // Enter key
    document.getElementById('city-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            var city = this.value.trim();
            if (city) loadCity(city);
        }
    });

    function loadCity(city) {
        currentCity = city;
        document.getElementById('map-loading').style.display = 'block';

        ymaps.geocode(city, { results: 1 }).then(function(res) {
            var firstResult = res.geoObjects.get(0);
            if (!firstResult) {
                document.getElementById('map-loading').style.display = 'none';
                alert('Город не найден. Попробуйте другой запрос.');
                return;
            }
            var coords = firstResult.geometry.getCoordinates();
            map.setCenter(coords, 12, { duration: 300 });
            loadOffices(coords[0], coords[1]);
        }).catch(function() {
            document.getElementById('map-loading').style.display = 'none';
            alert('Город не найден. Попробуйте другой запрос.');
        });
    }

    function loadOffices(lat, lng) {
        var xhr = new XMLHttpRequest();
        var url = 'https://widget.cdek.ru/widget/scripts/service.php?action=offices&lang=rus&country=RU&city=' +
            encodeURIComponent(currentCity);

        xhr.open('GET', url, true);
        xhr.onload = function() {
            try {
                var data = JSON.parse(xhr.responseText);
                if (data && data.pvz) {
                    displayOffices(data.pvz);
                } else if (Array.isArray(data)) {
                    displayOfficesArray(data);
                } else {
                    searchYandex(lat, lng);
                }
            } catch(e) {
                searchYandex(lat, lng);
            }
        };
        xhr.onerror = function() {
            searchYandex(lat, lng);
        };
        xhr.send();
    }

    function displayOffices(pvzObj) {
        clusterer.removeAll();
        var placemarks = [];

        for (var code in pvzObj) {
            var p = pvzObj[code];
            if (!p.coord || !p.coord.lat || !p.coord.lng) continue;
            placemarks.push(createPlacemark(
                [parseFloat(p.coord.lat), parseFloat(p.coord.lng)],
                p.name || 'ПВЗ СДЭК',
                p.address || '',
                p.worktime || '',
                p.phone || ''
            ));
        }

        clusterer.add(placemarks);
        document.getElementById('map-loading').style.display = 'none';

        if (placemarks.length === 0) {
            searchYandex(map.getCenter()[0], map.getCenter()[1]);
        }
    }

    function displayOfficesArray(arr) {
        clusterer.removeAll();
        var placemarks = [];

        arr.forEach(function(p) {
            var lat = p.latitude || (p.location && p.location.latitude);
            var lng = p.longitude || (p.location && p.location.longitude);
            if (!lat || !lng) return;
            placemarks.push(createPlacemark(
                [parseFloat(lat), parseFloat(lng)],
                p.name || p.code || 'ПВЗ СДЭК',
                p.address_full || p.address || '',
                p.work_time || '',
                p.phone || ''
            ));
        });

        clusterer.add(placemarks);
        document.getElementById('map-loading').style.display = 'none';

        if (placemarks.length === 0) {
            searchYandex(map.getCenter()[0], map.getCenter()[1]);
        }
    }

    function searchYandex(lat, lng) {
        ymaps.geocode('СДЭК ' + currentCity, { results: 50 }).then(function(res) {
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
            document.getElementById('map-loading').style.display = 'none';
        }).catch(function() {
            document.getElementById('map-loading').style.display = 'none';
        });
    }

    function createPlacemark(coords, name, address, hours, phone) {
        var body = '<div class="pvz-info">' +
            '<b>' + escHtml(name) + '</b>' +
            (address ? '<div class="pvz-addr">' + escHtml(address) + '</div>' : '') +
            (hours ? '<div class="pvz-hours">' + escHtml(hours) + '</div>' : '') +
            (phone ? '<div class="pvz-phone">' + escHtml(phone) + '</div>' : '') +
            '</div>';

        return new ymaps.Placemark(coords, {
            balloonContentHeader: '',
            balloonContentBody: body
        }, {
            preset: 'islands#greenDotIcon'
        });
    }

    function escHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }
})();
