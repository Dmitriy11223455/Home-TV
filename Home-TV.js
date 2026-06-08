(function () {
    'use strict';

    // 1. Красивые современные стили
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 30px 40px; height: 100%; position: relative; overflow: hidden; box-sizing: border-box; }' +
            '.home-tv-group { margin-bottom: 40px; }' +
            '.home-tv-group-title { font-size: 1.6em; font-weight: 700; color: #fff; margin-bottom: 18px; padding-left: 12px; border-left: 4px solid #f39c12; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; }' +
            '.home-tv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; padding: 10px 5px; }' +
            '.home-tv-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); text-align: center; min-height: 135px; box-sizing: border-box; position: relative; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; transform: scale(1.06); box-shadow: 0 10px 25px rgba(243, 156, 18, 0.4); border-color: #f39c12; }' +
            '.home-tv-card__icon { width: 100%; height: 55px; margin-bottom: 12px; background-size: contain; background-repeat: no-repeat; background-position: center; flex-shrink: 0; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3)); transition: transform 0.25s ease; }' +
            '.home-tv-card.focus .home-tv-card__icon { filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.5)); }' +
            '.home-tv-card__title { font-size: 1.15em; font-weight: 600; line-height: 1.3; word-break: break-word; transition: color 0.25s ease; }' +
        '</style>').appendTo('body');
    }

    // 2. Компонент
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html   = $('<div class="home-tv-list"></div>');
        var inner  = $('<div></div>');
        
        // Группировка каналов
        var groups = [
            {
                title: 'Федеральные',
                channels: [
                    { title: 'ПЕРВЫЙ КАНАЛ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/pervy.png' },
                    { title: 'Россия 1', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-1.png' },
                    { title: 'НТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/ntv.png' },
                    { title: 'Россия 24', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-24.png' },
                    { title: 'Россия K', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/kultura.png' },
                    { title: 'РТР Планета', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_smotrim.m3u', img: '' },
                    { title: 'Россия-РТР', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: '' }
                ]
            },
            {
                title: 'Развлекательные',
                channels: [
                    { title: 'ТНТ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/tnt.png' },
                    { title: 'СТС', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts.png' },
                    { title: 'СТС Int.', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts-int.png' },
                    { title: 'СТС Love', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts-love.png' },
                    { title: 'РЕН ТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/my-tv-grabber/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/18.png' },
                    { title: 'Ю HD', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/yu.png' },
                    { title: 'Чё!', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/che.png' }
                ]
            },
            {
                title: 'Кино и Спорт',
                channels: [
                    { title: 'МАТЧ ТВ!', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/match-tv.png' },
                    { title: 'ТОП 100', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/rossia1.png' }
                ]
            }
        ];

        this.render = function () { 
            return html; 
        };

        this.create = function () {
            inner.empty();

            groups.forEach(function (group) {
                var groupBlock = $('<div class="home-tv-group"></div>');
                var groupTitle = $('<div class="home-tv-group-title">' + group.title + '</div>');
                var gridContainer = $('<div class="home-tv-grid"></div>');
                
                groupBlock.append(groupTitle).append(gridContainer);

                group.channels.forEach(function (channel) {
                    var card = $('<div class="home-tv-card selector">' +
                        '<div class="home-tv-card__icon" style="background-image: url(' + (channel.img || '') + ')"></div>' +
                        '<div class="home-tv-card__title">' + channel.title + '</div>' +
                    '</div>');

                    // Фикс фокуса для идеального скролла в сетке
                    card.on('hover:focus', function () {
                        scroll.update($(this)); 
                    });

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
                                    Lampa.Player.play({ 
                                        url: streamUrl.split('|')[0], 
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
                                Lampa.Noty.show('Ошибка загрузки');
                            }
                        });
                    });

                    gridContainer.append(card);
                });

                inner.append(groupBlock);
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
                up:    function () { Lampa.Controller.move('up'); },
                down:  function () { Lampa.Controller.move('down'); },
                left:  function () { Lampa.Controller.move('left'); }, // Добавлено для навигации по сетке
                right: function () { Lampa.Controller.move('right'); }, // Добавлено для навигации по сетке
                back:  function () { Lampa.Activity.backward(); }
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

    Lampa.Listener.follow('app', function (e) { 
        if (e.type == 'ready') addPlugin(); 
    });
})();
