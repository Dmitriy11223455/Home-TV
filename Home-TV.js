(function () {
    'use strict';

    function startPlugin() {
        var network = new Lampa.Request();

        // 1. РЕГИСТРАЦИЯ КОМПОНЕНТА (СТРАНИЦА КАНАЛОВ)
        Lampa.Component.add('hybrid_tv', function (object, exam) {
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div></div>');

            this.create = function () {
                // --- ТВОЙ СПИСОК КАНАЛОВ ПРЯМО В КОДЕ ---
                var data = [
                    {
                        title: 'Общие каналы',
                        channels: [
                            { title: 'Первый канал', url: 'https://site-a.com', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i },
                            { title: 'Россия 1', url: 'https://site-a.com', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i }
                        ]
                    },
                    {
                        title: 'Развлекательные',
                        channels: [
                            { title: 'ТНТ', url: 'https://site-b.net', regex: /file:"(.*?\.m3u8)"/i },
                            { title: 'СТС', url: 'https://site-b.net', regex: /file:"(.*?\.m3u8)"/i }
                        ]
                    }
                ];

                // Отрисовка категорий и кнопок
                data.forEach(function (cat) {
                    html.append('<div class="category__title">' + cat.title + '</div>');
                    
                    cat.channels.forEach(function (channel) {
                        var card = Lampa.Template.get('button_item', {title: channel.title});
                        
                        card.on('hover:enter', function () {
                            Lampa.Noty.show('Поиск потока: ' + channel.title);
                            
                            // Используем прокси Кулика для обхода блокировок
                            var proxiedUrl = 'http://kulik.uz' + channel.url;

                            network.native(proxiedUrl, function (response) {
                                var match = channel.regex.exec(response);
                                if (match) {
                                    // Очистка ссылки (берем группу [1] если есть, иначе весь match [0])
                                    var stream = (match[1] ? match[1] : match[0]).replace(/["']/g, '').trim();
                                    
                                    Lampa.Player.play({
                                        url: stream,
                                        title: channel.title
                                    });
                                } else {
                                    Lampa.Noty.error('Поток не найден');
                                }
                            }, function () {
                                Lampa.Noty.error('Ошибка сети или прокси');
                            }, false, {dataType: 'text'});
                        });

                        html.append(card);
                        items.push(card);
                    });
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

        // 2. ОТОБРАЖЕНИЕ В МЕНЮ (СТИЛЬ KULIK TV)
        function addMenu() {
            if ($('.menu__list [data-action="hybrid"]').length) return;

            var item = $('<li class="menu__item selector" data-action="hybrid">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="currentColor"/></svg></div>' +
                '<div class="menu__text">Гибрид ТВ</div>' +
                '</li>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'Каналы', component: 'hybrid_tv' });
            });

            // Вставка перед настройками
            var settings = $('.menu__list [data-action="settings"]');
            if (settings.length) settings.before(item);
            else $('.menu__list').append(item);
        }

        // Запуск отображения
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addMenu();
        });
        setTimeout(addMenu, 2000); // Резерв на случай медленной загрузки
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();

