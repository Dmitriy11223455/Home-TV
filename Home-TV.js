(function () {
    'use strict';

    // 1. Стили интерфейса
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; height: 100%; position: relative; overflow: hidden; }' +
            '.home-tv-card { display: flex; align-items: center; margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; border-left: 5px solid #f39c12; transition: all 0.2s; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 60px; height: 40px; margin-right: 15px; background-size: contain; background-repeat: no-repeat; background-position: center; flex-shrink: 0; }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
            '</style>').appendTo('body');
    }

    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-list"></div>');
        var inner = $('<div></div>');
        
        // ВАШИ ССЫЛКИ ИЗ ФАЙЛА
        var channels = [
            { 
                title: 'ПЕРВЫЙ КАНАЛ', 
                url: 'https://githubusercontent.com', 
                img: 'https://iptvx.one',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://televizor24tochka.ru' }
            },
            { 
                title: 'ТНТ', 
                url: 'https://githubusercontent.com', 
                img: 'https://iptvx.one' 
            },
            { 
                title: 'СТС', 
                url: 'https://githubusercontent.com', 
                img: 'https://iptvx.one',
                headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://ctc.ru' }
            },
            { 
                title: 'Луганск 24', 
                url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', 
                img: 'https://iptvx.one' 
            },
            { 
                title: 'НТВ', 
                url: 'https://githubusercontent.com', 
                img: 'https://iptvx.one' 
            },
            { 
                title: 'РЕН ТВ', 
                url: 'https://githubusercontent.com', 
                img: 'https://iptvx.one' 
            },
            { 
                title: 'Россия 24', 
                url: 'https://githubusercontent.com', 
                img: 'https://iptvx.one' 
            },
            { 
                title: 'РТР Планета', 
                url: 'https://githubusercontent.com', 
                img: '',
                headers: { 'User-Agent': 'AppleCoreMedia/1.0.0.19G82', 'Referer': 'https://smotrim.ru' }
            }
        ];

        // Стандартные заголовки (если не указаны выше)
        var defaultHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Referer': 'https://televizor24tochka.ru'
        };

        this.create = function () {
            channels.forEach(function (channel) {
                var card = $('<div class="home-tv-card selector">' +
                    '<div class="home-tv-card__icon" style="background-image: url(' + (channel.img || '') + ')"></div>' +
                    '<div class="home-tv-card__title">' + channel.title + '</div>' +
                    '</div>');

                card.on('hover:focus', function (e) { scroll.update($(e.target)); });
                
                card.on('hover:enter click', function () {
                    Lampa.Noty.show('Поиск: ' + channel.title);
                    $.ajax({
                        url: channel.url,
                        method: 'GET',
                        dataType: 'text',
                        success: function(data) {
                            var lines = data.split('\n');
                            var streamUrl = '';
                            var searchName = channel.title.toLowerCase().replace(/\s/g, '');
                            
                            for (var i = 0; i < lines.length; i++) {
                                var line = lines[i].trim();
                                if (line.toUpperCase().indexOf('#EXTINF') > -1 && line.toLowerCase().replace(/\s/g, '').indexOf(searchName) > -1) {
                                    // Проверяем 3 следующие строки на наличие ссылки
                                    for (var j = i + 1; j <= i + 3 && j < lines.length; j++) {
                                        if (lines[j].trim().startsWith('http')) {
                                            streamUrl = lines[j].trim().split('|')[0]; // Чистый URL
                                            break;
                                        }
                                    }
                                }
                                if (streamUrl) break;
                            }

                            if (streamUrl) {
                                var h = channel.headers || defaultHeaders;
                                var formattedUrl = streamUrl + '|User-Agent=' + encodeURIComponent(h['User-Agent']) + '&Referer=' + encodeURIComponent(h['Referer']);

                                Lampa.Player.play({
                                    url: formattedUrl,
                                    title: channel.title
                                });
                            } else {
                                Lampa.Noty.show('Канал не найден в плейлисте');
                            }
                        },
                        error: function() { Lampa.Noty.show('Ошибка загрузки плейлиста'); }
                    });
                });
                inner.append(card);
            });
            scroll.append(inner);
            html.append(scroll.render(true));
            return html;
        };

        this.render = function () { return html; };
        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(html.find('.selector').first(), html);
                },
                up: function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };
        this.create();
    });

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

    if (window.appready) addPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addPlugin(); });
})();







