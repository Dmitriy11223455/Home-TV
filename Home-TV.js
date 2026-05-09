(function () {
    'use strict';

    function startPlugin() {
        var network = new Lampa.Request();

        // --- РЕГИСТРАЦИЯ В РАСШИРЕНИЯХ (КАК У КУЛИКА) ---
        Lampa.Plugins.add({
            name: 'Гибрид ТВ (Мод)',
            version: '1.2.0',
            description: 'Каналы с парсингом на лету',
            auth: false
        });

        // --- КОМПОНЕНТ СТРАНИЦЫ КАНАЛОВ ---
        Lampa.Component.add('hybrid_mod', function (object, exam) {
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div></div>');

            this.create = function () {
                // --- СЮДА ДОБАВЛЯЙ СВОИ САЙТЫ И РЕГУЛЯРКИ ---
                var my_channels = [
                    { 
                        title: 'Первый канал', 
                        url: 'https://site-a.com', 
                        regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i 
                    },
                    { 
                        title: 'ТНТ онлайн', 
                        url: 'https://site-b.net', 
                        regex: /file:"(.*?\.m3u8)"/i 
                    }
                ];

                my_channels.forEach(function (channel) {
                    var card = Lampa.Template.get('button_item', {title: channel.title});
                    
                    card.on('hover:enter', function () {
                        Lampa.Noty.show('Поиск потока...');
                        
                        // Используем проверенный CORS-прокси Kulik
                        var proxiedUrl = 'http://kulik.uz' + channel.url;

                        network.native(proxiedUrl, function (response) {
                            var match = channel.regex.exec(response);
                            if (match) {
                                // Извлекаем ссылку (чистим от кавычек)
                                var stream = (match[1] ? match[1] : match[0]).replace(/["']/g, '').trim();
                                
                                Lampa.Player.play({
                                    url: stream,
                                    title: channel.title
                                });
                            } else {
                                Lampa.Noty.error('Поток не найден в коде сайта');
                            }
                        }, function () {
                            Lampa.Noty.error('Ошибка доступа к сайту');
                        }, false, {dataType: 'text'});
                    });

                    html.append(card);
                    items.push(card);
                });
                scroll.append(html);
            };

            this.render = function () { return scroll.render(); };
            this.active = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(items, html);
                        Lampa.Controller.navigate('content');
                    },
                    up: function () { Lampa.Controller.toggle('head'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
        });

        // --- СИСТЕМНАЯ ОТРИСОВКА В МЕНЮ (МЕТОД KULIK) ---
        function addMenuItem() {
            if ($('.menu__list [data-action="hybrid_mod"]').length) return;

            var item = $('<li class="menu__item selector" data-action="hybrid_mod">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg></div>' +
                '<div class="menu__text">ГИБРИД ТВ</div>' +
            '</li>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'Мои Каналы', component: 'hybrid_mod' });
            });

            // Kulik вставляет себя над настройками
            var settings = $('.menu__list [data-action="settings"]');
            if (settings.length) settings.before(item);
            else $('.menu__list').append(item);
        }

        // Ждем готовности системы
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                addMenuItem();
                setTimeout(addMenuItem, 1000);
            }
        });
        
        // Резервный запуск
        if (window.appready) addMenuItem();
    }

    // Запуск всего процесса
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
