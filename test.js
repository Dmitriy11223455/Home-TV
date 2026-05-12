(function () {
    'use strict';

    // 1. Стили (без изменений)
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; }' +
            '.home-tv-card { margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; border-left: 5px solid #f39c12; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; transform: scale(1.02); }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
        '</style>').appendTo('body');
    }

    // 2. Компонент (без изменений)
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-list"></div>');
        
        var channels = [
            { title: 'Первый канал', url: 'https://githubusercontent.com' },
            { title: 'ТНТ', url: 'https://githubusercontent.com' },
            { title: 'Россия 1', url: 'https://raw.githubusercontent.com/Dmitriy11223455/FREE_IPTV/refs/heads/main/RusTVLive.m3u8' },
            { title: 'СТС', url: 'https://githubusercontent.com' },
            { title: 'РЕН ТВ', url: 'https://githubusercontent.com' }
        ];

        this.create = function () {
            var inner = $('<div></div>');
            html.empty();

            channels.forEach(function (channel) {
                var card = $('<div class="home-tv-card selector">' +
                    '<div class="home-tv-card__title">' + channel.title + '</div>' +
                '</div>');

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Ищу поток для ' + channel.title);
                    
                    $.ajax({
                        url: channel.url,
                        method: 'GET',
                        dataType: 'text',
                        success: function(data) {
                            var lines = data.split('\n');
                            var streamUrl = '';
                            var searchName = channel.title.toLowerCase();

                            for (var i = 0; i < lines.length; i++) {
                                if (lines[i].toLowerCase().indexOf('#extinf') > -1 && lines[i].toLowerCase().indexOf(searchName) > -1) {
                                    for (var j = i + 1; j < lines.length; j++) {
                                        var line = lines[j].trim();
                                        if (line.startsWith('http')) {
                                            streamUrl = line;
                                            break;
                                        }
                                        if (line.startsWith('#EXTINF')) break;
                                    }
                                }
                                if (streamUrl) break;
                            }

                            if (streamUrl) {
                                Lampa.Player.play({ url: streamUrl, title: channel.title });
                            } else {
                                Lampa.Noty.show('Канал не найден в плейлисте');
                            }
                        },
                        error: function() {
                            Lampa.Noty.show('Ошибка загрузки плейлиста');
                        }
                    });
                });
                inner.append(card);
            });

            html.append(scroll.render());
            scroll.append(inner);
            return this.render();
        };

        this.render = function () { return html; };

        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () { 
                    Lampa.Controller.collectionSet(html); 
                    Lampa.Controller.collectionFocus(html.find('.selector')[0], html); 
                },
                up: function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };
        
        this.create();
    });

    // 3. Добавление в меню (ИЗМЕНЕНО)
    function addPlugin() {
        // Проверяем, не добавлен ли уже пункт
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;

        var menu_item = {
            title: 'HOME TV',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg>',
            type: 'home_tv'
        };

        // Используем штатный метод Lampa для добавления пункта в меню
        Lampa.Menu.add(menu_item);

        // Вешаем событие на клик по нашему пункту
        $('.menu__item[data-action="home_tv"]').off('hover:enter click').on('hover:enter click', function () {
            Lampa.Activity.push({
                title: 'HOME TV',
                component: 'home_tv_plugin',
                page: 1
            });
        });
    }

    // Слушаем готовность приложения
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            addPlugin();
        }
    });

})();


