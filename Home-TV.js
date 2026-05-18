(function () {
    'use strict';

    // 1. Стили
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; height: 100%; position: relative; overflow: hidden; }' +
            '.home-tv-card { display: flex; align-items: center; margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; border-left: 5px solid #f39c12; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 60px; height: 40px; margin-right: 15px; background-size: contain; background-repeat: no-repeat; background-position: center; flex-shrink: 0; }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
        '</style>').appendTo('body');
    }

    // 2. Компонент
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html   = $('<div class="home-tv-list"></div>');
        var inner  = $('<div></div>');
        
        // Автоматично визначаємо адресу вашого воркера
        var workerUrl = window.location.origin + '/?url=';
        
        var channels = [
            { title: 'ПЕРВЫЙ КАНАЛ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/pervy.png' },
            { title: 'ТНТ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/tnt.png' },
            { title: 'ТОП 100', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/rossia1.png' },
            { title: 'СТС Int.', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts-int.png' },
            { title: 'РЕН ТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/my-tv-grabber/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/18.png' },
            { title: 'МАТЧ ТВ!', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/match-tv.png' },
            { title: 'НТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/ntv.png' },
            { title: 'Россия 24', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-24.png' },
            { title: 'РТР Планета', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_smotrim.m3u', img: '' },
            { title: 'Россия-РТР', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: '' },
            { title: 'Ю HD', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/yu.png' },
            { title: 'Чё!', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/che.png' },
            { title: 'Россия К', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/kultura.png' },
            { title: 'СТС', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts.png' },
            { title: 'СТС Love', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts-love.png' },
        ];

        this.render = function () { 
            return html; 
        };

        // Фікс помилки UI Lampa (Обов'язковий метод для запуску вікна)
        this.start = function () {
            // Залишаємо порожнім, бо створення вже викликається нижче
        };

        this.create = function () {
            inner.empty();

            channels.forEach(function (channel) {
                var card = $('<div class="home-tv-card selector">' +
                    '<div class="home-tv-card__icon" style="background-image: url(' + (channel.img || '') + ')"></div>' +
                    '<div class="home-tv-card__title">' + channel.title + '</div>' +
                '</div>');

                // Обновление скролла при наведении
                card.on('hover:focus', function (e) {
                    scroll.update($(e.target)); 
                });

                card.on('hover:enter click', function () {
                    Lampa.Noty.show('Ищу поток для ' + channel.title);
                    
                    // Завантажуємо файл .m3u через ваш прокси
                    var proxiedM3uUrl = workerUrl + encodeURIComponent(channel.url);

                    $.ajax({
                        url: proxiedM3uUrl,
                        method: 'GET',
                        dataType: 'text',
                        success: function(data) {
                            var lines = data.split('\n');
                            var streamUrl = '';
                            
                            // Приводимо назву до нижнього регістру
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
                                var rawUrl = streamUrl.split('|')[0].trim();
                                
                                // Проксуємо сам стрим перед відтворенням
                                var finalUrl = workerUrl + encodeURIComponent(rawUrl);

                                Lampa.Player.play({ 
                                    url: finalUrl, 
                                    title: channel.title,
                                    headers: {
                                        'Referer': 'https://mediavitrina.ru',
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                                    }
                                });
                            } else {
                                Lampa.Noty.show('Канал не найден');
                            }
                        },
                        error: function() {
                            Lampa.Noty.show('Ошибка загрузки плейлиста');
                        }
                    });
                });

                inner.append(card);
            });

            scroll.append(inner);
            html.append(scroll.render(true));
            
            return this.render();
        };

        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () { 
                    Lampa.Controller.collectionSet(html); 
                    Lampa.Controller.collectionFocus(html.find('.selector')[0], html); 
                },
                up:   function () { Lampa.Controller.move('up'); },
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

    if (window.Lampa) addPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addPlugin();
        });
    }
})();



