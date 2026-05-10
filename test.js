(function () {
    'use strict';

    // 1. Стили интерфейса
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; }' +
            '.home-tv-card { margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; border-left: 5px solid #f39c12; transition: 0.2s; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; transform: scale(1.02); }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
        '</style>').appendTo('body');
    }

    // 2. Компонент плагина
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-list"></div>');
        
        // --- ТВОЙ СПИСОК КАНАЛОВ ---
        // Скрипт найдет в плейлисте тот канал, чье название (title) совпадет с текстом в файле
        var channels = [
            { title: 'Первый канал', url: 'https://githubusercontent.com' },
            { title: 'ТНТ', url: 'https://githubusercontent.com' },
            { title: 'Россия 1', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVmir.m3u8' },
            { title: 'Кинохит', url: 'https://githubusercontent.com' }
        ];

        this.create = function () {
            var inner = $('<div></div>');
            html.empty();

            channels.forEach(function (channel) {
                var card = $('<div class="home-tv-card selector">' +
                    '<div class="home-tv-card__title">' + channel.title + '</div>' +
                '</div>');

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Поиск потока для ' + channel.title + '...');
                    
                    $.ajax({
                        url: 'https://corsproxy.io?' + encodeURIComponent(channel.url),
                        method: 'GET',
                        success: function(data) {
                            var lines = data.split('\n');
                            var streamUrl = '';

                            // Поиск нужного канала внутри m3u8
                            for (var i = 0; i < lines.length; i++) {
                                // Ищем строку с названием (без учета регистра)
                                if (lines[i].toUpperCase().indexOf(channel.title.toUpperCase()) > -1) {
                                    // Если нашли, берем следующую строку (где лежит ссылка http)
                                    for (var j = i + 1; j < lines.length; j++) {
                                        if (lines[j].trim().startsWith('http')) {
                                            streamUrl = lines[j].trim();
                                            break;
                                        }
                                        if (lines[j].startsWith('#EXTINF')) break; // Прерываем, если пошел другой канал
                                    }
                                }
                                if (streamUrl) break;
                            }

                            if (streamUrl) {
                                Lampa.Player.play({ 
                                    url: streamUrl, 
                                    title: channel.title 
                                });
                            } else {
                                Lampa.Noty.show('Канал не найден в плейлисте');
                            }
                        },
                        error: function() {
                            Lampa.Noty.show('Ошибка загрузки плейлиста с GitHub');
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

    // 3. Кнопка в меню
    function addPlugin() {
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;

        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
            '<div class="menu__text">HOME TV</div>' +
            '</li>');

        menu_item.on('hover:enter click', function () {
            Lampa.Activity.push({
                title: 'HOME TV',
                component: 'home_tv_plugin',
                page: 1
            });
        });

        var list = $('.menu .menu__list');
        if (list.length) {
            var settings = list.find('[data-action="settings"]').closest('li');
            if (settings.length) settings.before(menu_item);
            else list.append(menu_item);
        }
    }

    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') addPlugin();
    });

    var waitMenu = setInterval(function() {
        addPlugin();
        if ($('.menu__item[data-action="home_tv"]').length > 0) clearInterval(waitMenu);
    }, 1000);

})();

