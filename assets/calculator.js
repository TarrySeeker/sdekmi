/* ============================================
   CDEK Calculator
   ============================================ */

$(document).ready(function() {
    var API_URL = 'https://api.cdek.me/service.php';

    // --- Built-in city database (name + CDEK code) ---
    var CITIES = [
        {name:'Москва',code:44},{name:'Санкт-Петербург',code:137},{name:'Новосибирск',code:270},
        {name:'Екатеринбург',code:380},{name:'Казань',code:611},{name:'Нижний Новгород',code:414},
        {name:'Челябинск',code:453},{name:'Самара',code:312},{name:'Омск',code:268},
        {name:'Ростов-на-Дону',code:261},{name:'Уфа',code:396},{name:'Красноярск',code:287},
        {name:'Воронеж',code:193},{name:'Пермь',code:342},{name:'Волгоград',code:180},
        {name:'Краснодар',code:431},{name:'Саратов',code:325},{name:'Тюмень',code:400},
        {name:'Тольятти',code:322},{name:'Ижевск',code:344},{name:'Барнаул',code:291},
        {name:'Ульяновск',code:326},{name:'Иркутск',code:295},{name:'Хабаровск',code:221},
        {name:'Ярославль',code:138},{name:'Владивосток',code:228},{name:'Махачкала',code:547},
        {name:'Томск',code:274},{name:'Оренбург',code:337},{name:'Кемерово',code:281},
        {name:'Новокузнецк',code:282},{name:'Рязань',code:157},{name:'Астрахань',code:432},
        {name:'Набережные Челны',code:615},{name:'Пенза',code:319},{name:'Липецк',code:160},
        {name:'Тула',code:164},{name:'Киров',code:347},{name:'Чебоксары',code:363},
        {name:'Калининград',code:152},{name:'Брянск',code:191},{name:'Курск',code:161},
        {name:'Иваново',code:142},{name:'Магнитогорск',code:455},{name:'Улан-Удэ',code:300},
        {name:'Тверь',code:163},{name:'Ставрополь',code:479},{name:'Белгород',code:188},
        {name:'Сочи',code:474},{name:'Нижний Тагил',code:384},{name:'Архангельск',code:127},
        {name:'Владимир',code:139},{name:'Калуга',code:147},{name:'Смоленск',code:162},
        {name:'Чита',code:302},{name:'Волжский',code:181},{name:'Саранск',code:357},
        {name:'Сургут',code:401},{name:'Вологда',code:128},{name:'Орёл',code:156},
        {name:'Тамбов',code:167},{name:'Грозный',code:551},{name:'Мурманск',code:131},
        {name:'Петрозаводск',code:133},{name:'Кострома',code:149},{name:'Йошкар-Ола',code:351},
        {name:'Нижневартовск',code:405},{name:'Новороссийск',code:441},{name:'Комсомольск-на-Амуре',code:222},
        {name:'Таганрог',code:261},{name:'Сыктывкар',code:116},{name:'Нальчик',code:555},
        {name:'Дзержинск',code:415},{name:'Шахты',code:262},{name:'Орск',code:339},
        {name:'Братск',code:296},{name:'Ангарск',code:293},{name:'Старый Оскол',code:189},
        {name:'Великий Новгород',code:134},{name:'Благовещенск',code:225},
        {name:'Энгельс',code:330},{name:'Псков',code:135},{name:'Бийск',code:292},
        {name:'Прокопьевск',code:283},{name:'Рыбинск',code:155},{name:'Балаково',code:327},
        {name:'Северодвинск',code:126},{name:'Армавир',code:438},{name:'Абакан',code:286},
        {name:'Петропавловск-Камчатский',code:234},{name:'Норильск',code:289},
        {name:'Южно-Сахалинск',code:238},{name:'Якутск',code:244},{name:'Сызрань',code:321},
        {name:'Волгодонск',code:259},{name:'Каменск-Уральский',code:381},
        {name:'Новочеркасск',code:260},{name:'Златоуст',code:454},{name:'Альметьевск',code:617},
        {name:'Миасс',code:456},{name:'Копейск',code:459},{name:'Электросталь',code:72},
        {name:'Находка',code:229},{name:'Керчь',code:676},{name:'Севастополь',code:677},
        {name:'Симферополь',code:675},{name:'Ялта',code:679},{name:'Евпатория',code:678},
        {name:'Феодосия',code:680},{name:'Минеральные Воды',code:481},
        {name:'Пятигорск',code:480},{name:'Кисловодск',code:482},
        {name:'Обнинск',code:148},{name:'Люберцы',code:60},{name:'Мытищи',code:62},
        {name:'Подольск',code:65},{name:'Балашиха',code:47},{name:'Химки',code:94},
        {name:'Королёв',code:58},{name:'Домодедово',code:51},{name:'Одинцово',code:63},
        {name:'Красногорск',code:59},{name:'Серпухов',code:79},{name:'Щёлково',code:98},
        {name:'Долгопрудный',code:50},{name:'Реутов',code:74},{name:'Жуковский',code:53},
        {name:'Раменское',code:73},{name:'Пушкино',code:71},{name:'Ногинск',code:67},
        {name:'Коломна',code:57},{name:'Дмитров',code:49},{name:'Клин',code:55},
        {name:'Воскресенск',code:48},{name:'Егорьевск',code:52},{name:'Видное',code:202},
        {name:'Геленджик',code:436},{name:'Анапа',code:435},{name:'Ейск',code:437},
        {name:'Туапсе',code:476},{name:'Майкоп',code:539},{name:'Назрань',code:556},
        {name:'Элиста',code:549},{name:'Черкесск',code:543},{name:'Владикавказ',code:559},
        {name:'Кызыл',code:303},{name:'Горно-Алтайск',code:304},{name:'Биробиджан',code:223},
        {name:'Магас',code:556},{name:'Магадан',code:236},{name:'Анадырь',code:243},
        {name:'Нарьян-Мар',code:118},{name:'Салехард',code:408},{name:'Ханты-Мансийск',code:403}
    ];

    // --- City Autocomplete (local filtering) ---
    function setupAutocomplete(inputId, hiddenId) {
        $('#' + inputId).autocomplete({
            source: function(request, response) {
                var term = request.term.toLowerCase();
                var matches = [];
                for (var i = 0; i < CITIES.length && matches.length < 10; i++) {
                    if (CITIES[i].name.toLowerCase().indexOf(term) !== -1) {
                        matches.push({
                            label: CITIES[i].name,
                            value: CITIES[i].name,
                            id: CITIES[i].code
                        });
                    }
                }
                response(matches);
            },
            minLength: 1,
            select: function(event, ui) {
                $('#' + hiddenId).val(ui.item.id);
            }
        });

        // Clear hidden city ID when user manually edits the text
        $('#' + inputId).on('input', function() {
            $('#' + hiddenId).val('');
        });
    }

    setupAutocomplete('from_location', 'senderCityId');
    setupAutocomplete('to_location', 'receiverCityId');

    // --- Swap Cities ---
    document.getElementById('swap-cities').addEventListener('click', function() {
        var fromVal = $('#from_location').val();
        var fromId = $('#senderCityId').val();
        var toVal = $('#to_location').val();
        var toId = $('#receiverCityId').val();

        $('#from_location').val(toVal);
        $('#senderCityId').val(toId);
        $('#to_location').val(fromVal);
        $('#receiverCityId').val(fromId);
    });

    // --- Input Validation (remove error on typing) ---
    document.querySelectorAll('.calc-field input').forEach(function(input) {
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.classList.remove('invalid');
            }
        });
    });

    // --- Modal Close ---
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('calc-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    function closeModal() {
        document.getElementById('calc-modal').classList.remove('visible');
        document.getElementById('calcBtn').disabled = false;
    }

    // --- Error Modal Close ---
    document.getElementById('error-modal-close').addEventListener('click', function() {
        document.getElementById('error-modal').classList.remove('visible');
    });
    document.getElementById('error-modal').addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('visible');
    });

    // --- Form Submit ---
    $('#calc-form').on('submit', function(e) {
        e.preventDefault();

        // Validate required fields
        var requiredFields = ['from_location', 'to_location', 'length', 'height', 'weight', 'width'];
        var valid = true;

        requiredFields.forEach(function(id) {
            var input = document.getElementById(id);
            if (!input.value.trim()) {
                input.classList.add('invalid');
                valid = false;
            } else {
                input.classList.remove('invalid');
            }
        });

        if (!valid) return;

        // Validate that cities were selected from autocomplete
        if (!$('#senderCityId').val() || !$('#receiverCityId').val()) {
            if (!$('#senderCityId').val()) {
                $('#from_location').addClass('invalid');
            }
            if (!$('#receiverCityId').val()) {
                $('#to_location').addClass('invalid');
            }
            document.getElementById('error-modal-text').textContent =
                'Выберите город из выпадающего списка';
            document.getElementById('error-modal').classList.add('visible');
            return;
        }

        // Disable button and show loader
        var calcBtn = document.getElementById('calcBtn');
        calcBtn.disabled = true;
        document.querySelector('.calc-overlay').classList.add('visible');

        // Detect mobile
        var isMobile = window.matchMedia('(max-width: 768px)').matches ? 1 : 0;

        // API request
        $.ajax({
            url: API_URL,
            type: 'POST',
            data: {
                type: 1,
                currency: '1',
                tariff_code: '136',
                fromLocationCode: $('#senderCityId').val(),
                toLocationCode: $('#receiverCityId').val(),
                fromLocation: $('#from_location').val(),
                toLocation: $('#to_location').val(),
                email: 'test@mail.ru',
                phone: '7911111111',
                insurance: $('#insurance').val() || '0',
                length: $('#length').val(),
                height: $('#height').val(),
                weight: $('#weight').val(),
                width: $('#width').val(),
                recepient: 'd.dobychin@cdek.ru',
                isMobile: isMobile
            },
            success: function(data) {
                document.querySelector('.calc-overlay').classList.remove('visible');

                if (data.success) {
                    document.getElementById('result-data').innerHTML = data.html;
                } else {
                    document.getElementById('result-data').innerHTML =
                        '<p style="color:var(--red);text-align:center;padding:20px;">Ошибка: ' +
                        (data.error || 'Неизвестная ошибка') + '</p>';
                }
                document.getElementById('calc-modal').classList.add('visible');
            },
            error: function() {
                document.querySelector('.calc-overlay').classList.remove('visible');
                document.getElementById('result-data').innerHTML =
                    '<p style="color:var(--red);text-align:center;padding:20px;">Произошла ошибка при расчёте. Попробуйте позже.</p>';
                document.getElementById('calc-modal').classList.add('visible');
            }
        });
    });
});
