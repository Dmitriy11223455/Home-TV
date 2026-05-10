(function () {
    'use strict';

    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; }' +
            '.home-tv-card { margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
            '.home-tv-card__desc { font-size: 0.9em; opacity: 0.7; margin-top: 5px; }' +
        '</style>').appendTo('body');
    }

    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-list"></div>');
        
        // Сюда вставляй ссылки на СТРАНИЦЫ с каналами
        var channels = [
            { title: 'Первый канал Европа', url: 'https://berezka.live', desc: 'Авто-поиск потока m3u8...' },
            { title: 'ТНТ', url: 'https://berezka.live', desc: 'Авто-поиск потока m3u8...' },
            { title: 'Кино ТВ', url: 'http://oneliketv.net', desc: 'Авто-поиск потока m3u8...' }
        ];

        this.create = function () {
            var inner = $('<div></div>');
            html.empty();

            channels.forEach(function (channel) {
                var card = $('<div class="home-tv-card selector">' +
                    '<div class="home-tv-card__title">' + channel.title + '</div>' +
                    '<div class="home-tv-card__desc">' + channel.desc + '</div>' +
                '</div>');

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Сканирую сеть (F12 mode)...');
                    
                    // Используем мощный CORS прокси для доступа к коду сайта
                    $.ajax({
                        url: 'https://allorigins.win' + encodeURIComponent(channel.url),
                        method: 'GET',
                        dataType: 'json',
                        success: function(response) {
                            var content = response.contents;
                            
                            // Регулярка ищет любую ссылку, заканчивающуюся на .m3u8
                            // Это программный аналог поиска в закладке Network
                            var match = content.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
                            
                            if (match && match[0]) {
                                var streamUrl = match[0].replace(/\\/g, ''); // Чистим от лишних слешей
                                Lampa.Noty.show('Поток найден!');
                                Lampa.Player.play({ url: streamUrl, title: channel.title });
                            } else {
                                Lampa.Noty.show('В коде страницы нет .m3u8');
                            }
                        },
                        error: function() {
                            Lampa.Noty.show('Сайт заблокировал запрос');
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

    function addPlugin() {
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;
        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
            '<div class="menu__text">HOME TV</div>' +
            '</li>');
        menu_item.on('hover:enter click', function () {
            Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin', page: 1 });
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


