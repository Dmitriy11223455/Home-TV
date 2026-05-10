(function () {
    'use strict';

    function startPlugin() {
        // 1. КОМПОНЕНТ С КАНАЛАМИ
        Lampa.Component.add('home_tv_plugin', function (object, exam) {
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div class="category-full"></div>');

            this.create = function () {
                var my_channels = [
                    { title: 'Первый канал', url: 'https://site-a.com', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i },
                    { title: 'ТНТ', url: 'https://site-b.net', regex: /file:"(.*?\.m3u8)"/i }
                ];

                my_channels.forEach(function (channel) {
                    var card = Lampa.Template.get('button_item', {title: channel.title});
                    card.on('hover:enter', function () {
                        Lampa.Noty.show('Поиск потока...');
                        
                        // Создаем запрос ПРЯМО ТУТ, чтобы не было ошибки "not a constructor"
                        var network = new Lampa.Request();
                        var proxiedUrl = 'http://kulik.uz' + channel.url;

                        network.native(proxiedUrl, function (response) {
                            var match = channel.regex.exec(response);
                            if (match) {
                                // Берем первый элемент массива (саму ссылку)
                                var stream_url = match[1] ? match[1] : match[0];
                                var stream = stream_url.replace(/["']/g, '').trim();
                                Lampa.Player.play({ url: stream, title: channel.title });
                            } else { Lampa.Noty.error('Не найдено'); }
                        }, function () { Lampa.Noty.error('Ошибка прокси'); }, false, {dataType: 'text'});
                    });
                    html.append(card);
                    items.push(card);
                });
                scroll.append(html);
            };

            this.render = function () { return scroll.render(); };
            this.active = function () {
                Lampa.Controller.add('content', {
                    toggle: function () { Lampa.Controller.collectionSet(items, html); Lampa.Controller.navigate('content'); },
                    up: function () { Lampa.Controller.toggle('head'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
        });

        // 2. НАСИЛЬНАЯ ОТРИСОВКА В МЕНЮ
        function injectMenu() {
            // Если кнопка уже есть — ничего не делаем
            if ($('li[data-action="home_tv"]').length > 0) return;

            var menu = $('.menu__list');
            if (menu.length > 0) {
                var item = $('<li class="menu__item selector" data-action="home_tv">' +
                    '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                    '<div class="menu__text">HOME TV</div>' +
                    '</li>');

                item.on('hover:enter', function () {
                    $('body').removeClass('menu--open'); // Закрыть меню на мобилках
                    Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
                });

                // Вставляем перед пунктом "Настройки"
                var settings = menu.find('[data-action="settings"]');
                if (settings.length > 0) settings.before(item);
                else menu.append(item);

                // Обновляем контроллер для работы пульта
                if (window.Lampa && Lampa.Controller && Lampa.Controller.update) {
                    Lampa.Controller.update();
                }
            }
        }

        // Запуск проверки каждую секунду (чтобы не исчезало в Lampa UV)
        setInterval(injectMenu, 1000);
        injectMenu();
    }

    // Ожидание готовности
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
