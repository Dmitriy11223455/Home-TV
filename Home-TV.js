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
(function () {
    'use strict';

    // 1. РЕГИСТРАЦИЯ И СИНХРОНИЗАЦИЯ СТИЛЕЙ ИНТЕРФЕЙСА
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-container { display: flex; width: 100%; height: 100%; background: #141414; position: relative; overflow: hidden; box-sizing: border-box; }' +
            '.home-tv-sidebar { width: 280px; padding: 30px 15px; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); box-sizing: border-box; }' +
            '.home-tv-sidebar__title { font-size: 2.2em; font-weight: bold; margin-bottom: 25px; padding-left: 10px; color: #fff; }' +
            '.home-tv-sidebar-list { display: flex; flex-direction: column; gap: 4px; }' +
            '.home-tv-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-radius: 8px; cursor: pointer; color: #a0a0a0; font-size: 1.2em; transition: background 0.2s, color 0.2s; }' +
            '.home-tv-sidebar-item__left { display: flex; align-items: center; gap: 12px; }' +
            '.home-tv-sidebar-item__icon { display: flex; align-items: center; opacity: 0.6; color: #fff; }' +
            '.home-tv-sidebar-item.focus { background: rgba(255,255,255,0.1); color: #fff; }' +
            '.home-tv-sidebar-item.focus .home-tv-sidebar-item__icon { opacity: 1; }' +
            '.home-tv-sidebar-item__count { font-size: 0.9em; opacity: 0.5; font-family: monospace; }' +
            '.home-tv-channels-wrap { width: 340px; height: 100%; padding: 25px 10px; box-sizing: border-box; position: relative; border-right: 1px solid rgba(255,255,255,0.03); }' +
            '.home-tv-channel-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; padding-right: 5px; }' +
            '.home-tv-channel-number { width: 45px; text-align: right; font-size: 1.4em; color: #666; font-weight: 600; font-family: monospace; }' +
            '.home-tv-card { flex: 1; height: 90px; background: rgba(255,255,255,0.04); border: 2.5px solid transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 10px; box-sizing: border-box; }' +
            '.home-tv-card.focus { border-color: #ffffff; background: rgba(255,255,255,0.12); transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center; }' +
            '.home-tv-card__title-fallback { font-size: 1.1em; font-weight: bold; text-align: center; color: #fff; opacity: 0.8; }' +
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

    // 2. ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСНОГО КОМПОНЕНТА СЕТКИ
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html   = $('<div class="home-tv-container"></div>');
        var scroll_inner = $('<div></div>');
        scroll.append(scroll_inner);

        // База данных телеканалов Кулик TV
        var base_groups = [
            {
                title: 'Основные',
                channels: [
                    { title: 'ПЕРВЫЙ КАНАЛ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/pervy.png' },
                    { title: 'Россия 1', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-1.png' },
                    { title: 'НТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/ntv.png' },
                    { title: 'Россия 24', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-24.png' },
                    { title: 'Россия К', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/kultura.png' }
                ]
            },
            {
                title: 'Развлекательные',
                channels: [
                    { title: 'ТНТ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/tnt.png' },
                    { title: 'СТС', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts.png' },
                    { title: 'РЕН ТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/my-tv-grabber/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/18.png' }
                ]
            }
        ];

        var all_channels = [];
        base_groups.forEach(function (g) { all_channels = all_channels.concat(g.channels); });

        var groups = [
            { title: 'Все каналы', channels: all_channels, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><circle cx="3" cy="6" r="1" fill="currentColor"></circle><circle cx="3" cy="12" r="1" fill="currentColor"></circle><circle cx="3" cy="18" r="1" fill="currentColor"></circle></svg>' }
        ];

        base_groups.forEach(function (g) {
            groups.push({
                title: g.title,
                channels: g.channels,
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
            });
        });

        var sidebar = $('<div class="home-tv-sidebar"><div class="home-tv-sidebar__title">Кулик TV</div><div class="home-tv-sidebar-list"></div></div>');
        var channelsWrap = $('<div class="home-tv-channels-wrap"></div>');
        var infoPanel = $('<div class="home-tv-info">' +
            '<div class="home-tv-info__group">-</div>' +
            '<div class="home-tv-info__title">-</div>' +
            '<div class="home-tv-info__epg">' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--med"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--short"></div></div>' +
            '</div>' +
        '</div>');

        html.append(sidebar).append(channelsWrap).append(infoPanel);
        channelsWrap.append(scroll.render(true));

        this.render = function () { return html; };

        // РЕНДЕРИНГ СПИСКА КАНАЛОВ ПРИ СМЕНЕ ЗОНЫ ИЛИ ФОКУСА
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

                card.on('hover:focus', function () {
                    scroll.update($(this)); 
                    infoPanel.find('.home-tv-info__group').text(group.title);
                    infoPanel.find('.home-tv-info__title').text(channel.title);
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Запуск потока: ' + channel.title);
                });

                scroll_inner.append(row);
            });

            // КРИТИЧЕСКИЙ ШАГ: Мгновенно переиндексируем HTML-коллекцию для Lampa
            Lampa.Controller.collectionSet(html);
        };

        this.create = function () {
            var sidebarList = sidebar.find('.home-tv-sidebar-list');
            sidebarList.empty();

            groups.forEach(function (group) {
                var sItem = $('<div class="home-tv-sidebar-item selector">' +
                    '<div class="home-tv-sidebar-item__left">' +
                        '<span class="home-tv-sidebar-item__icon">' + group.icon + '</span>' +
                        '<span class="home-tv-sidebar-item__text">' + group.title + '</span>' +
                    '</div>' +
                    '<div class="home-tv-sidebar-item__count">' + group.channels.length + '</div>' +
                '</div>');

                sItem.on('hover:focus', function () {
                    sidebarList.find('.home-tv-sidebar-item').removeClass('focus');
                    sItem.addClass('focus');
                    showChannels(group);
                });

                sidebarList.append(sItem);
            });

            if (groups.length > 0) showChannels(groups[0]);
            return this.render();
        };

        // 3. МОДУЛЬ АППАРАТНОГО ПЕРЕКЛЮЧЕНИЯ ИЗОЛИРОВАННЫХ ЗОН УПРАВЛЕНИЯ
        this.active = function () {
            var current_zone = 'sidebar'; 

            Lampa.Controller.add('kulik_tv_ctrl', {
                toggle: function () { 
                    current_zone = 'sidebar';
                    Lampa.Controller.collectionSet(html); 
                    var firstMenuElem = html.find('.home-tv-sidebar-item.selector').first()[0];
                    Lampa.Controller.collectionFocus(firstMenuElem, html); 
                },
                up:    function () { Lampa.Controller.move('up'); },
                down:  function () { Lampa.Controller.move('down'); },
                left:  function () { 
                    // Жесткий возврат из сетки каналов к меню
                    if (current_zone === 'channels') {
                        current_zone = 'sidebar';
                        var activeCategory = html.find('.home-tv-sidebar-item.focus')[0] || html.find('.home-tv-sidebar-item.selector').first()[0];
                        Lampa.Controller.collectionFocus(activeCategory, html);
                    }
                },
                right: function () { 
                    // Жесткий переход из меню к первому каналу
                    if (current_zone === 'sidebar') {
                        var firstChannelCard = html.find('.home-tv-card.selector').first()[0];
                        if (firstChannelCard) {
                            current_zone = 'channels';
                            Lampa.Controller.collectionFocus(firstChannelCard, html);
                        }
                    }
(function () {
    'use strict';

    // 1. РЕГИСТРАЦИЯ И СИНХРОНИЗАЦИЯ СТИЛЕЙ ИНТЕРФЕЙСА
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-container { display: flex; width: 100%; height: 100%; background: #141414; position: relative; overflow: hidden; box-sizing: border-box; }' +
            '.home-tv-sidebar { width: 280px; padding: 30px 15px; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1); box-sizing: border-box; }' +
            '.home-tv-sidebar__title { font-size: 2.2em; font-weight: bold; margin-bottom: 25px; padding-left: 10px; color: #fff; }' +
            '.home-tv-sidebar-list { display: flex; flex-direction: column; gap: 4px; }' +
            '.home-tv-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-radius: 8px; cursor: pointer; color: #a0a0a0; font-size: 1.2em; transition: background 0.2s, color 0.2s; }' +
            '.home-tv-sidebar-item__left { display: flex; align-items: center; gap: 12px; }' +
            '.home-tv-sidebar-item__icon { display: flex; align-items: center; opacity: 0.6; color: #fff; }' +
            '.home-tv-sidebar-item.focus { background: rgba(255,255,255,0.1); color: #fff; }' +
            '.home-tv-sidebar-item.focus .home-tv-sidebar-item__icon { opacity: 1; }' +
            '.home-tv-sidebar-item__count { font-size: 0.9em; opacity: 0.5; font-family: monospace; }' +
            '.home-tv-channels-wrap { width: 340px; height: 100%; padding: 25px 10px; box-sizing: border-box; position: relative; border-right: 1px solid rgba(255,255,255,0.03); }' +
            '.home-tv-channel-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; padding-right: 5px; }' +
            '.home-tv-channel-number { width: 45px; text-align: right; font-size: 1.4em; color: #666; font-weight: 600; font-family: monospace; }' +
            '.home-tv-card { flex: 1; height: 90px; background: rgba(255,255,255,0.04); border: 2.5px solid transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 10px; box-sizing: border-box; }' +
            '.home-tv-card.focus { border-color: #ffffff; background: rgba(255,255,255,0.12); transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center; }' +
            '.home-tv-card__title-fallback { font-size: 1.1em; font-weight: bold; text-align: center; color: #fff; opacity: 0.8; }' +
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

    // 2. ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСНОГО КОМПОНЕНТА СЕТКИ
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html   = $('<div class="home-tv-container"></div>');
        var scroll_inner = $('<div></div>');
        scroll.append(scroll_inner);

        // База данных телеканалов Кулик TV
        var base_groups = [
            {
                title: 'Основные',
                channels: [
                    { title: 'ПЕРВЫЙ КАНАЛ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/pervy.png' },
                    { title: 'Россия 1', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-1.png' },
                    { title: 'НТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/ntv.png' },
                    { title: 'Россия 24', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u', img: 'https://iptvx.one/picons/rossia-24.png' },
                    { title: 'Россия К', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/kultura.png' }
                ]
            },
            {
                title: 'Развлекательные',
                channels: [
                    { title: 'ТНТ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/tnt.png' },
                    { title: 'СТС', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u', img: 'https://iptvx.one/picons/sts.png' },
                    { title: 'РЕН ТВ', url: 'https://raw.githubusercontent.com/Dmitriy11223455/my-tv-grabber/refs/heads/main/playlist.m3u', img: 'https://iptvx.one/picons/18.png' }
                ]
            }
        ];

        var all_channels = [];
        base_groups.forEach(function (g) { all_channels = all_channels.concat(g.channels); });

        var groups = [
            { title: 'Все каналы', channels: all_channels, icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><circle cx="3" cy="6" r="1" fill="currentColor"></circle><circle cx="3" cy="12" r="1" fill="currentColor"></circle><circle cx="3" cy="18" r="1" fill="currentColor"></circle></svg>' }
        ];

        base_groups.forEach(function (g) {
            groups.push({
                title: g.title,
                channels: g.channels,
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
            });
        });

        var sidebar = $('<div class="home-tv-sidebar"><div class="home-tv-sidebar__title">Кулик TV</div><div class="home-tv-sidebar-list"></div></div>');
        var channelsWrap = $('<div class="home-tv-channels-wrap"></div>');
        var infoPanel = $('<div class="home-tv-info">' +
            '<div class="home-tv-info__group">-</div>' +
            '<div class="home-tv-info__title">-</div>' +
            '<div class="home-tv-info__epg">' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--med"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text"></div></div>' +
                '<div class="home-tv-epg-line"><div class="home-tv-epg-bullet"></div><div class="home-tv-epg-text home-tv-epg-text--short"></div></div>' +
            '</div>' +
        '</div>');

        html.append(sidebar).append(channelsWrap).append(infoPanel);
        channelsWrap.append(scroll.render(true));

        this.render = function () { return html; };

        // РЕНДЕРИНГ СПИСКА КАНАЛОВ ПРИ СМЕНЕ ЗОНЫ ИЛИ ФОКУСА
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

                card.on('hover:focus', function () {
                    scroll.update($(this)); 
                    infoPanel.find('.home-tv-info__group').text(group.title);
                    infoPanel.find('.home-tv-info__title').text(channel.title);
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Запуск потока: ' + channel.title);
                });

                scroll_inner.append(row);
            });

            // КРИТИЧЕСКИЙ ШАГ: Мгновенно переиндексируем HTML-коллекцию для Lampa
            Lampa.Controller.collectionSet(html);
        };

        this.create = function () {
            var sidebarList = sidebar.find('.home-tv-sidebar-list');
            sidebarList.empty();

            groups.forEach(function (group) {
                var sItem = $('<div class="home-tv-sidebar-item selector">' +
                    '<div class="home-tv-sidebar-item__left">' +
                        '<span class="home-tv-sidebar-item__icon">' + group.icon + '</span>' +
                        '<span class="home-tv-sidebar-item__text">' + group.title + '</span>' +
                    '</div>' +
                    '<div class="home-tv-sidebar-item__count">' + group.channels.length + '</div>' +
                '</div>');

                sItem.on('hover:focus', function () {
                    sidebarList.find('.home-tv-sidebar-item').removeClass('focus');
                    sItem.addClass('focus');
                    showChannels(group);
                });

                sidebarList.append(sItem);
            });

            if (groups.length > 0) showChannels(groups[0]);
            return this.render();
        };

        // 3. МОДУЛЬ АППАРАТНОГО ПЕРЕКЛЮЧЕНИЯ ИЗОЛИРОВАННЫХ ЗОН УПРАВЛЕНИЯ
        this.active = function () {
            var current_zone = 'sidebar'; 

            Lampa.Controller.add('kulik_tv_ctrl', {
                toggle: function () { 
                    current_zone = 'sidebar';
                    Lampa.Controller.collectionSet(html); 
                    var firstMenuElem = html.find('.home-tv-sidebar-item.selector').first()[0];
                    Lampa.Controller.collectionFocus(firstMenuElem, html); 
                },
                up:    function () { Lampa.Controller.move('up'); },
                down:  function () { Lampa.Controller.move('down'); },
                left:  function () { 
                    // Жесткий возврат из сетки каналов к меню
                    if (current_zone === 'channels') {
                        current_zone = 'sidebar';
                        var activeCategory = html.find('.home-tv-sidebar-item.focus')[0] || html.find('.home-tv-sidebar-item.selector').first()[0];
                        Lampa.Controller.collectionFocus(activeCategory, html);
                    }
                },
                right: function () { 
                    // Жесткий переход из меню к первому каналу
                    if (current_zone === 'sidebar') {
                        var firstChannelCard = html.find('.home-tv-card.selector').first()[0];
                        if (firstChannelCard) {
                            current_zone = 'channels';
                            Lampa.Controller.collectionFocus(firstChannelCard, html);
                        }
                    }
                },
                back:  function () { 
                    // Умная кнопка BACK: сначала выходит из каналов, потом из плагина
                    if (current_zone === 'channels') {
                        current_zone = 'sidebar';
                        var activeCategory = html.find('.home-tv-sidebar-item.focus')[0];
                        Lampa.Controller.collectionFocus(activeCategory, html);
                    } else {
                        Lampa.Activity.backward();
                    }
                }
            });
            Lampa.Controller.toggle('kulik_tv_ctrl');
        };

        this.create();
    });

    // 4. ИНТЕГРАЦИЯ ПУНКТА НАВИГАЦИИ В ГЛАВНУЮ ПАНЕЛЬ LAMPA
    function addPlugin() {
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;
        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
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
