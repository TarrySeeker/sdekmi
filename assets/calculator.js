/* ============================================
   CDEK Calculator
   ============================================ */

$(document).ready(function() {
    var API_URL = 'https://api.cdek.me/service.php';

    // --- City Autocomplete (local filtering, uses CITIES from cities.js) ---
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
