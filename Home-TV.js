(function () {
    'use strict';

    function startPlugin() {
        var network = new Lampa.Request();

        // 1. КОМПОНЕНТ ПЛАГИНА
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
                        var proxiedUrl = 'http://kulik.uz' + channel.url;

                        network.native(proxiedUrl, function (response) {
                            var match = channel.regex.exec(response);
                            if (match) {
                                var stream = (match[1] ? match[1] : match[0]).replace(/["']/g, '').trim();
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

        // 2. МЕТОД «ГРУБОЙ СИЛЫ» ДЛЯ МЕНЮ
        function forceRenderMenu() {
            // Если пункт уже есть — стоп
            if ($('.menu__list [data-action="home_tv"]').length > 0) return;

            var menu = $('.menu__list');
            if (menu.length > 0) {
                var item = $('<li class="menu__item selector" data-action="home_tv">' +
                    '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                    '<div class="menu__text">HOME TV</div>' +
                    '</li>');

                item.on('hover:enter', function () {
                    // Закрываем меню (актуально для UV/мобилок)
                    $('body').removeClass('menu--open');
                    Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
                });

                // Вставляем строго перед настройками
                var settings = menu.find('[data-action="settings"]');
                if (settings.length > 0) settings.before(item);
                else menu.append(item);

                // Принудительно обновляем навигацию, чтобы пульт «увидел» кнопку
                if (window.Lampa.Controller && Lampa.Controller.update) Lampa.Controller.update();
            }
        }

        // Запускаем бесконечный цикл проверки (раз в секунду)
        setInterval(forceRenderMenu, 1000);

        // Следим за изменениями экрана (если меню перерисовано движком)
        var observer = new MutationObserver(forceRenderMenu);
        observer.observe(document.body, { childList: true, subtree: true });

        forceRenderMenu();
    }

    // Ожидание готовности
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
