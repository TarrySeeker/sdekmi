/* ============================================
   CDEK Tracking
   ============================================ */

(function() {
    var API_URL = 'https://api.cdek.me/info/proxy.php';

    var ERRORS = {
        cant_determine_order: 'Заказ с указанным номером не найден',
        v2_internal_error: 'Запрос выполнился с системной ошибкой',
        v2_similar_request_still_processed: 'Предыдущий запрос ещё не выполнился',
        v2_bad_request: 'Передан некорректный запрос',
        v2_invalid_format: 'Передано некорректное значение',
        v2_field_is_empty: 'Не передано обязательное поле',
        v2_parameters_empty: 'Все параметры запроса пустые',
        v2_invalid_value_type: 'Передан некорректный тип данных',
        v2_entity_not_found: 'Заказ с указанным номером не найден',
        v2_entity_not_found_im_number: 'Заказ с указанным номером не найден',
        v2_entity_forbidden: 'Заказ принадлежит другому клиенту',
        v2_order_not_found: 'Заказ с указанным номером не найден',
        v2_order_forbidden: 'Заказ принадлежит другому клиенту',
        v2_order_number_empty: 'Не переданы номер и идентификатор заказа'
    };

    // Pull alerts out of the proxy error shape: the real CDEK response is
    // serialised into data.raw_response as JSON, and top-level errors are in
    // data.error. Returns a user-facing string or null if none found.
    function extractError(data) {
        if (data.raw_response) {
            try {
                var raw = JSON.parse(data.raw_response);
                if (raw && raw.alerts && raw.alerts.length) {
                    return raw.alerts
                        .map(function(a) {
                            return ERRORS[a.errorCode] || a.msg || 'Неизвестная ошибка';
                        })
                        .join('\n');
                }
            } catch (e) { /* fall through */ }
        }
        if (data.error) return data.error;
        return null;
    }

    function formatDate(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        var pad = function(n) { return n < 10 ? '0' + n : String(n); };
        return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() +
               ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    window.addEventListener('DOMContentLoaded', function() {
        var form = document.getElementById('track-form');
        var input = document.getElementById('track-input');
        var bar = document.querySelector('.track-bar');
        var errorEl = document.querySelector('.track-error');
        var resultsContainer = document.getElementById('track-results');

        function showError(msg) {
            bar.classList.add('error');
            bar.style.width = '100%';
            setTimeout(function() {
                errorEl.textContent = msg;
            }, 300);
        }

        function clearError() {
            bar.classList.remove('error');
            bar.style.width = '1px';
            errorEl.textContent = '';
        }

        input.addEventListener('focus', clearError);

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Remove previous results
            resultsContainer.innerHTML = '';

            var trackNum = input.value.trim();
            if (!trackNum) {
                showError('Введите трек-номер');
                return;
            }

            clearError();
            bar.style.width = '30%';

            fetch(API_URL + '?invoiceNumber=' + encodeURIComponent(trackNum))
                .then(function(res) {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then(function(data) {
                    if (data.success === false) {
                        showError(extractError(data) || 'Заказ не найден');
                        return;
                    }
                    if (!data.trackingDetails || !data.trackingDetails.length) {
                        showError('По этому номеру нет информации об отправлении');
                        return;
                    }

                    bar.style.width = '100%';
                    renderResults(data);
                })
                .catch(function() {
                    showError('Что-то пошло не так, попробуйте ещё раз');
                });
        });

        function renderResults(data) {
            var statuses = (data.trackingDetails || []).slice().reverse();
            var currentStatus = data.status || {};

            // Build HTML
            var html = '<div class="track-info">';
            html += '<div class="track-info-left">';

            // Status header
            html += '<div class="track-status-header">';
            html += '<span class="track-status-label">Статус</span>';
            html += '<span class="track-status-value">' + escHtml(currentStatus.name || '') + '</span>';
            html += '</div>';

            // Timeline
            html += '<div class="track-timeline">';
            for (var i = 0; i < statuses.length; i++) {
                var st = statuses[i];
                var isCurrent = (i === statuses.length - 1);
                var classes = 'status-item success';
                if (isCurrent) {
                    classes += ' current visible';
                } else {
                    classes += ' hidden';
                }

                var showLine = (i < statuses.length - 1);

                html += '<div class="' + classes + '">';
                html += '<div class="status-dot-col">';
                html += '<div class="status-dot"></div>';
                if (showLine) {
                    html += '<div class="status-line"></div>';
                }
                html += '</div>';
                html += '<div class="status-content">';
                html += '<div class="status-meta">';
                html += '<span class="status-date">' + escHtml(formatDate(st.date)) + '</span>';
                html += '<span class="status-city">' + escHtml(st.cityName || '') + '</span>';
                html += '</div>';
                html += '<div class="status-name">' + escHtml(st.statusName || '') + '</div>';
                html += '</div>';
                html += '</div>';
            }
            html += '</div>';

            // Toggle buttons
            if (statuses.length > 1) {
                html += '<div class="track-toggle track-toggle--down" id="toggle-show">';
                html += '<span>Показать весь путь</span>';
                html += '<svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M11 0.5L6 5.5L1 0.5" stroke="#40851D"/></svg>';
                html += '</div>';
                html += '<div class="track-toggle track-toggle--up hidden" id="toggle-hide">';
                html += '<span>Свернуть</span>';
                html += '<svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M11 0.5L6 5.5L1 0.5" stroke="#40851D"/></svg>';
                html += '</div>';
            }

            html += '</div>'; // track-info-left
            html += '</div>'; // track-info

            resultsContainer.innerHTML = html;

            // Toggle click handlers
            var showBtn = document.getElementById('toggle-show');
            var hideBtn = document.getElementById('toggle-hide');

            if (showBtn && hideBtn) {
                showBtn.addEventListener('click', toggleAll);
                hideBtn.addEventListener('click', toggleAll);
            }
        }

        function toggleAll() {
            var items = resultsContainer.querySelectorAll('.status-item:not(.current)');
            var showBtn = document.getElementById('toggle-show');
            var hideBtn = document.getElementById('toggle-hide');
            var isExpanded = !showBtn.classList.contains('hidden');

            items.forEach(function(item, i) {
                setTimeout(function() {
                    if (isExpanded) {
                        item.classList.remove('hidden');
                        item.classList.add('visible');
                    } else {
                        item.classList.remove('visible');
                        item.classList.add('hidden');
                    }
                }, i * 30);
            });

            showBtn.classList.toggle('hidden');
            hideBtn.classList.toggle('hidden');
        }

        function escHtml(s) {
            if (!s) return '';
            var d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        }
    });
})();
