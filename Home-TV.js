(function () {
    'use strict';

    function startPlugin() {
        var network = new Lampa.Request();

        // 1. КОМПОНЕНТ С КАНАЛАМИ (Твоя личная страница)
        Lampa.Component.add('my_hybrid_tv', function (object, exam) {
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div></div>');

            this.create = function () {
                // --- ТВОИ САЙТЫ ТУТ ---
                var my_list = [
                    {
                        title: 'Общие',
                        channels: [
                            { title: 'Первый канал', url: 'https://site-a.com', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i },
                            { title: 'Россия 1', url: 'https://site-a.com', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i }
                        ]
                    },
                    {
                        title: 'Развлекательные',
                        channels: [
                            { title: 'ТНТ', url: 'https://site-b.net', regex: /file:"(.*?\.m3u8)"/i }
                        ]
                    }
                ];

                my_list.forEach(function (cat) {
                    html.append('<div class="category__title">' + cat.title + '</div>');
                    var row = $('<div class="category__content"></div>');

                    cat.channels.forEach(function (channel) {
                        var card = Lampa.Template.get('button_item', {title: channel.title});
                        
                        card.on('hover:enter', function () {
                            Lampa.Noty.show('Парсинг через прокси...');
                            // Используем проверенный прокси от Kulik TV
                            var proxiedUrl = 'http://kulik.uz' + channel.url;

                            network.native(proxiedUrl, function (response) {
                                var match = channel.regex.exec(response);
                                if (match) {
                                    var stream = (match[1] ? match[1] : match[0]).replace(/["']/g, '').trim();
                                    Lampa.Player.play({ url: stream, title: channel.title });
                                } else { Lampa.Noty.error('Поток не найден'); }
                            }, function () { Lampa.Noty.error('Ошибка доступа'); }, false, {dataType: 'text'});
                        });
                        row.append(card);
                        items.push(card);
                    });
                    html.append(row);
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

        // 2. ОТРИСОВКА В МЕНЮ (Копируем стиль Kulik TV)
        function addMenu() {
            if ($('.menu__list [data-action="my_hybrid"]').length) return;

            var item = $('<li class="menu__item selector" data-action="my_hybrid">' +
                '<div class="menu__ico"><svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg></div>' +
                '<div class="menu__text">МОЁ ТВ</div>' +
            '</li>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'Мои Каналы', component: 'my_hybrid_tv' });
            });

            // Вставляем перед настройками, как делает Кулик
            var settings = $('.menu__list [data-action="settings"]');
            if (settings.length) settings.before(item);
            else $('.menu__list').append(item);
        }

        // Ждем готовности и вставляем
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                addMenu();
                setTimeout(addMenu, 1000);
            }
        });
        if (window.appready) addMenu();
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
