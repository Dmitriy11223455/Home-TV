;(function () {
    'use strict';

    var plugin = {
        component: 'home_tv_plugin',
        name: 'HOME TV'
    };

    // 1. Стили интерфейса
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; height: 100%; position: relative; overflow: hidden; }' +
            '.home-tv-card { display: flex; align-items: center; margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; border-left: 5px solid #f39c12; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 60px; height: 40px; margin-right: 15px; background-size: contain; background-repeat: no-repeat; background-position: center; flex-shrink: 0; }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
            '.player-info.info--visible.js-ch-home_tv { top: 9em; right: auto; z-index: 1000; }' +
        '</style>').appendTo('body');
    }

    // Список ваших каналов для быстрого поиска в M3U плейлистах
    var channels = [
        { title: 'Россия 1', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-1.png' },
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
        { title: 'СТС Love', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts-love.png' }
    ];

    var lastActiveCard = null;
    var chNumber = '';
    var chTimeout = null;
    var chPanel = $('<div class="player-info info--visible js-ch-home_tv"><div class="player-info__body"><div class="player-info__line"><div class="player-info__name">&nbsp;</div></div></div></div>').hide();

    // Проверка, что запущенный плеер принадлежит нашему плагину
    function isPluginPlaylist(playlist) {
        return playlist && playlist.length && playlist[0].plugin === plugin.component;
    }

    // Подхват переключения кнопками из интерфейса плеера Lampa
    Lampa.PlayerPlaylist.listener.follow('select', function(e) {
        if (e.item.plugin && e.item.plugin === plugin.component && Lampa.Player.runas) {
            Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
        }
    });

    // Логика переключения цифровыми кнопками пульта и кнопками CH+/CH-
    function channelSwitch(dig, isChNum) {
        if (!Lampa.Player.opened()) return false;
        var playlist = Lampa.PlayerPlaylist.get();
        if (!isPluginPlaylist(playlist)) return false;

        if (!$('body>.js-ch-home_tv').length) $('body').append(chPanel);
        
        var cnt = playlist.length;
        var prevChNumber = chNumber;
        chNumber += dig;
        var number = parseInt(chNumber);

        if (number && number <= cnt) {
            if (chTimeout) clearTimeout(chTimeout);
            chPanel.find('.player-info__name').text(playlist[number - 1].title);
            chPanel.finish().show().fadeIn(0);

            var chSwitchExec = function () {
                var pos = number - 1;
                if (Lampa.PlayerPlaylist.position() !== pos) {
                    Lampa.PlayerPlaylist.listener.send('select', {
                        playlist: playlist,
                        position: pos,
                        item: playlist[pos]
                    });
                    if (Lampa.Player.runas) Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                }
                chPanel.delay(1200).fadeOut(400);
                chNumber = "";
            };

            if (isChNum || parseInt(chNumber + '0') > cnt) {
                chSwitchExec();
            } else {
                chTimeout = setTimeout(chSwitchExec, 2500);
            }
        } else {
            chNumber = prevChNumber;
        }
        return true;
    }

    // Слушатель нажатий пульта (цифры и CH+/CH- / Вверх-Вниз во время видео)
    function keydownListener(e) {
        var code = e.code;
        if (Lampa.Player.opened() && !$('body.selectbox--open').length) {
            var playlist = Lampa.PlayerPlaylist.get();
            if (!isPluginPlaylist(playlist)) return;

            var isStopEvent = false;
            var curCh = Lampa.PlayerPlaylist.position() + 1;

            if (code === 428 || code === 34 || ((code === 37 || code === 4) && !$('.player.tv .panel--visible .focus').length && !$('.player.tv .player-footer.open .focus').length)) {
                curCh = curCh === 1 ? playlist.length : curCh - 1;
                isStopEvent = channelSwitch(curCh, true);
            } else if (code === 427 || code === 33 || ((code === 39 || code === 5) && !$('.player.tv .panel--visible .focus').length && !$('.player.tv .player-footer.open .focus').length)) {
                curCh = curCh === playlist.length ? 1 : curCh + 1;
                isStopEvent = channelSwitch(curCh, true);
            } else if (code >= 48 && code <= 57) {
                isStopEvent = channelSwitch(code - 48, false);
            } else if (code >= 96 && code <= 105) {
                isStopEvent = channelSwitch(code - 96, false);
            }

            if (isStopEvent) {
                e.event.preventDefault();
                e.event.stopPropagation();
            }
        }
    }

    // 2. Компонент интерфейса плагина
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html   = $('<div class="home-tv-list"></div>');
        var inner  = $('<div></div>');
        
        this.render = function () { 
            return html; 
        };

        this.create = function () {
            var _this = this;
            inner.empty();

            channels.forEach(function (channel, index) {
                var card = $('<div class="home-tv-card selector">' +
                    '<div class="home-tv-card__icon" style="background-image: url(' + (channel.img || '') + ')"></div>' +
                    '<div class="home-tv-card__title">' + channel.title + '</div>' +
                '</div>');

                // Исправлено: Скролл корректно следит за всей карточкой, а не за дочерними элементами text/img
                card.on('hover:focus', function (e) {
                    scroll.update(card, true); 
                    lastActiveCard = card[0];
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Ищу поток для ' + channel.title);
                    
                    $.ajax({
                        url: channel.url,
                        method: 'GET',
                        dataType: 'text',
                        headers: {
                            'Referer': 'https://mediavitrina.ru',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                        },
                        success: function(data) {
                            var lines = data.split(/\r?\n/);
                            var streamUrl = '';
                            var searchName = channel.title.toLowerCase();

                            for (var i = 0; i < lines.length; i++) {
                                var line = lines[i].trim();
                                if (line.toLowerCase().indexOf('#extinf') > -1 && line.toLowerCase().indexOf(searchName) > -1) {
                                    for (var j = i + 1; j <= i + 3 && j < lines.length; j++) {
                                        var nextLine = lines[j].trim();
                                        if (nextLine.startsWith('http')) {
                                            streamUrl = nextLine;
                                            break;
                                        }
                                    }
                                }
                                if (streamUrl) break;
                            }

                            if (streamUrl) {
                                // Формируем внутренний плейлист для возможности переключения внутри плеера пультами
                                var internalPlaylist = channels.map(function(ch) {
                                    return {
                                        title: ch.title,
                                        url: ch.url, // Ссылка на M3U-поиск (перехватывается динамически при переключении пульта)
                                        tv: true,
                                        plugin: plugin.component
                                    };
                                });

                                Lampa.Player.play({ 
                                    url: streamUrl.split('|')[0], 
                                    title: channel.title,
                                    playlist: internalPlaylist,
                                    position: index,
                                    headers: {
                                        'Referer': 'https://mediavitrina.ru',
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                                    }
                                });
                                Lampa.Player.playlist(internalPlaylist);
                                Lampa.PlayerPlaylist.position(index);
                                if (Lampa.Player.runas) Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                            } else {
                                Lampa.Noty.show('Поток для канала не найден в M3U');
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

        // Настройка управления контроллером Lampa
        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () { 
                    Lampa.Controller.collectionSet(html); 
                    var active = html.find('.selector.focus');
                    if (!active.length && lastActiveCard) active = $(lastActiveCard);
                    if (!active.length) active = html.find('.selector').eq(0);
                    
                    if (active.length) {
                        Lampa.Controller.collectionFocus(active[0], html); 
                    }
                },
                up:   function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };

        this.create();
    });

    // 3. Интеграция плагина в левое меню Lampa
    function addPlugin() {
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;
        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
            '<div class="menu__text">HOME TV</div>' +
            '</li>');
        
        menu_item.on('hover:enter click', function () {
            Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin', page: 1 });
        });
        
        $('.menu .menu__list').append(menu_item);
    }

    // Регистрация глобальных слушателей пульта Lampa
    Lampa.Keypad.listener.follow('keydown', keydownListener);

    // Безопасный запуск плагина при старте приложения
    if (window.lampa_started) {
        addPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) { 
            if (e.type == 'ready') addPlugin(); 
        });
    }
})();
