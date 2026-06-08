(function () {
    'use strict';

    // 1. Стили в точности как на скриншоте Кулик TV
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-container { display: flex; width: 100%; height: 100%; background: #141414; position: relative; overflow: hidden; box-sizing: border-box; }' +
            
            /* Левая колонка: Категории */
            '.home-tv-sidebar { width: 280px; padding: 30px 15px; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); box-sizing: border-box; }' +
            '.home-tv-sidebar__title { font-size: 2.2em; font-weight: bold; margin-bottom: 25px; padding-left: 10px; color: #fff; }' +
            '.home-tv-sidebar-list { display: flex; flex-direction: column; gap: 4px; }' +
            '.home-tv-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-radius: 8px; cursor: pointer; color: #a0a0a0; font-size: 1.2em; transition: background 0.2s, color 0.2s; }' +
            '.home-tv-sidebar-item__left { display: flex; align-items: center; gap: 12px; }' +
            '.home-tv-sidebar-item__icon { display: flex; align-items: center; opacity: 0.6; color: #fff; }' +
            '.home-tv-sidebar-item.focus { background: rgba(255,255,255,0.1); color: #fff; }' +
            '.home-tv-sidebar-item.focus .home-tv-sidebar-item__icon { opacity: 1; }' +
            '.home-tv-sidebar-item__count { font-size: 0.9em; opacity: 0.5; font-family: monospace; }' +
            
            /* Средняя колонка: Список каналов */
            '.home-tv-channels-wrap { width: 340px; height: 100%; padding: 25px 10px; box-sizing: border-box; position: relative; border-right: 1px solid rgba(255,255,255,0.03); }' +
            '.home-tv-channel-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; padding-right: 5px; }' +
            '.home-tv-channel-number { width: 45px; text-align: right; font-size: 1.4em; color: #666; font-weight: 600; font-family: monospace; }' +
            '.home-tv-card { flex: 1; height: 90px; background: rgba(255,255,255,0.04); border: 2.5px solid transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 10px; box-sizing: border-box; }' +
            '.home-tv-card.focus { border-color: #ffffff; background: rgba(255,255,255,0.12); transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center; }' +
            '.home-tv-card__title-fallback { font-size: 1.1em; font-weight: bold; text-align: center; color: #fff; opacity: 0.8; }' +
            
            /* Правая колонка: Инфо и Расписание (EPG) */
            '.home-tv-info { flex: 1; padding: 50px 40px; display: flex; flex-direction: column; box-sizing: border-box; }' +
            '.home-tv-info__group { font-size: 1.1em; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }' +
            '.home-tv-info__title { font-size: 2.6em; font-weight: bold; color: #fff; margin-bottom: 35px; line-height: 1.2; }' +
            '.home-tv-info__epg { display: flex; flex-direction: column; gap: 18px; opacity: 0.15; }' +
            '.home-tv-epg-line { display: flex; gap: 15px; align-items: center; }' +
            '.home-tv-epg-bullet { width: 35px; height: 12px; background: #fff; border-radius: 3px; flex-shrink: 0; }' +
            '.home-tv-epg-text { height: 12px; background: #fff; border-radius: 3px; flex: 1; }' +
            '.home-tv-epg-text--short { max-width: 120px; }' +
            '.home-tv-epg-text--med { max-width: 240px; }' +
        '</style>').appendTo('body');
    }

    // 2. Компонент
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html   = $('<div class="home-tv-container"></div>');
        
        // Внутренний контейнер для скролла каналов
        var scroll_inner = $('<div></div>');
        scroll.append(scroll_inner);

        // Исходные группы каналов
        var base_groups = [
            {
                title: 'Основные', // На скриншоте называется "Основные"
                channels: [
                    { title: 'ПЕРВЫЙ КАНАЛ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/pervy.png' },
                    { title: 'Россия 1', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-1.png' },
                    { title: 'НТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/ntv.png' },
                    { title: 'Россия 24', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-24.png' },
                    { title: 'Россия К', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/kultura.png' },
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

        // Собираем общую группу "Все каналы" автоматически
        var all_channels = [];
        base_groups.forEach(function (g) { all_channels = all_channels.concat(g.channels); });

        var groups = [
            { title: 'Все каналы', channels: all_channels, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>' }
        ];

        base_groups.forEach(function (g) {
            groups.push({
                title: g.title,
                channels: g.channels,
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
            });
        });

        // Элементы трех колонок
        var sidebar = $('<div class="home-tv-sidebar"><div class="home-tv-sidebar__title">Кулик TV</div><div class="home-tv-sidebar-list"></div></div>');
        var channelsWrap = $('<div class="home-tv-channels-wrap"></div>');
        var infoPanel = $('<div class="home-tv-info">' +
            '<div class="home-tv-info__group">-</div>' +
            '<div class="home-tv-info__title">-</div>' +
            '<div class="home-tv-info__epg">' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--med"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--short"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--med"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--short"></div></div>' +
            '</div>' +
        '</div>');

        html.append(sidebar).append(channelsWrap).append(infoPanel);
        channelsWrap.append(scroll.render(true));

        this.render = function () { 
            return html; 
        };

        // Функция обновления списка каналов в центральной колонке при смене группы
        var showChannels = function (group) {
            scroll_inner.empty();

            group.channels.forEach(function (channel, index) {
                var numStr = String(index + 1).padStart(3, '0');
                var row = $('<div class="home-tv-channel-row">' +
                    '<div class="home-tv-channel-number">' + numStr + '</div>' +
                    '<div class="home-tv-card selector">' +
                        (channel.img ? '<div class="home-tv-card__icon" style="background-image: url(' + channel.img + ')"></div>' : '<div class="home-tv-card__title-fallback">' + channel.title + '</div>') +
                    '</div>' +
                '</div>');

                var card = row.find('.home-tv-card');

                // При фокусе на канал — плавно скроллим и обновляем инфо-панель справа
                card.on('hover:focus', function () {
                    scroll.update($(this)); 
                    infoPanel.find('.home-tv-info__group').text(group.title);
                    infoPanel.find('.home-tv-info__title').text(channel.title);
                });

                // Воспроизведение (оригинальная неизмененная логика)
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

                scroll_inner.append(row);
            });
        };

        this.create = function () {
            var sidebarList = sidebar.find('.home-tv-sidebar-list');
            sidebarList.empty();

            // Заполняем левую колонку группами
            groups.forEach(function (group) {
                var sItem = $('<div class="home-tv-sidebar-item selector">' +
                    '<div class="home-tv-sidebar-item__left">' +
                        '<span class="home-tv-sidebar-item__icon">' + group.icon + '</span>' +
                        '<span class="home-tv-sidebar-item__text">' + group.title + '</span>' +
                    '</div>' +
                    '<div class="home-tv-sidebar-item__count">' + group.channels.length + '</div>' +
                '</div>');

                // При фокусе на группу пульта автоматически переключаем список каналов по центру
                sItem.on('hover:focus', function () {
                    showChannels(group);
                });

                sidebarList.append(sItem);
            });

            // По умолчанию загружаем первую группу
            if (groups.length > 0) showChannels(groups[0]);

            return this.render();
        };

        // Полное пространственное управление (Вверх, Вниз, Влево к группам, Вправо к каналам)
        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () { 
                    Lampa.Controller.collectionSet(html); 
                    Lampa.Controller.collectionFocus(html.find('.selector')[0], html); 
                },
                up:    function () { Lampa.Controller.move('up'); },
                down:  function () { Lampa.Controller.move('down'); },
                left:  function () { Lampa.Controller.move('left'); },
                right: function () { Lampa.Controller.move('right'); },
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
