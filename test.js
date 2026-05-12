(function () {
    'use strict';

    // 1. Стили
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; }' +
            '.home-tv-card { margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; border-left: 5px solid #f39c12; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; transform: scale(1.02); }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
        '</style>').appendTo('body');
    }

    // 2. Компонент
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-list"></div>');
        
        var channels = [
            { title: 'Первый канал', url: 'https://githubusercontent.com' },
            { title: 'ТНТ', url: 'https://githubusercontent.com' },
            { title: 'ТОП 100', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u' },
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
                    
                    var network = new Lampa.Network();
                    network.silent(channel.url, function (data) {
                        var lines = data.split('\n');
                        var streamUrl = '';
                        var searchName = channel.title.toLowerCase();

                        for (var i = 0; i < lines.length; i++) {
                            let line = lines[i].trim();
                            if (line.toLowerCase().indexOf('#extinf') > -1 && line.toLowerCase().indexOf(searchName) > -1) {
                                for (var j = i + 1; j <= i + 3 && j < lines.length; j++) {
                                    let nextLine = lines[j].trim();
                                    if (nextLine.startsWith('http')) {
                                        streamUrl = nextLine;
                                        break;
                                    }
                                }
                            }
                            if (streamUrl) break;
                        }

                        if (streamUrl) {
                            // ИСПРАВЛЕНИЕ: Добавление заголовков для обхода ошибки 409
                            Lampa.Player.play({ 
                                url: streamUrl, 
                                title: channel.title,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                                    'Referer': 'https://lampa.mx'
                                }
                            });
                        } else {
                            Lampa.Noty.show('Канал не найден в плейлисте');
                        }
                    }, function (a, c) {
                        Lampa.Noty.show('Ошибка загрузки плейлиста: ' + network.errorDecode(a, c));
                    }, false, { dataType: 'text' });
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
                    Lampa.Controller.collectionFocus(html.find('.selector'), html); 
                },
                up: function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };
        
        this.create();
    });

    // 3. Добавление в меню
    function addPlugin() {
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;
        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
            '<div class="menu__text">HOME TV</div>' +
            '</li>');
        
        menu_item.on('hover:enter click', function () {
            Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin', page: 1 });
        });
        
        $('.menu .menu__list').append(menu_item);
    }

    Lampa.Listener.follow('app', function (e) { 
        if (e.type == 'ready') addPlugin(); 
    });
    
    setInterval(addPlugin, 2000);
})();

