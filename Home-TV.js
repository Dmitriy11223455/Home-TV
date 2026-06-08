;(function () {
    'use strict';

    var plugin = {
        component: 'home_tv',
        name: 'HOME TV',
        version: '1.1.0'
    };

    // 1. Стили интерфейса один в один как на скриншоте
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-container { display: flex; width: 100%; height: 100%; background: #141414; position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; box-sizing: border-box; font-family: Roboto, Arial, sans-serif; }' +
            
            /* Левая колонка: Категории (Узкая, лаконичная) */
            '.home-tv-sidebar { width: 16rem; padding: 2rem 0.8rem; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); box-sizing: border-box; }' +
            '.home-tv-sidebar__title { font-size: 1.6rem; font-weight: bold; margin-bottom: 2rem; padding-left: 0.8rem; color: #fff; letter-spacing: 0.5px; text-transform: uppercase; }' +
            '.home-tv-sidebar-list { display: flex; flex-direction: column; gap: 0.3rem; overflow-y: auto; flex: 1; }' +
            '.home-tv-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; border-radius: 0.5rem; cursor: pointer; color: #a0a0a0; font-size: 1rem; transition: all 0.2s; }' +
            '.home-tv-sidebar-item__left { display: flex; align-items: center; gap: 0.8rem; }' +
            '.home-tv-sidebar-item__icon { display: flex; align-items: center; opacity: 0.5; color: #fff; }' +
            '.home-tv-sidebar-item__icon svg { width: 1.2rem; height: 1.2rem; }' +
            '.home-tv-sidebar-item.focus { background: #fff; color: #000; font-weight: bold; }' +
            '.home-tv-sidebar-item.focus .home-tv-sidebar-item__icon { opacity: 1; color: #000; }' +
            '.home-tv-sidebar-item__count { font-size: 0.8rem; opacity: 0.6; font-family: monospace; }' +
            
            /* Средняя колонка: Сетка каналов как на скриншоте */
            '.home-tv-channels-wrap { width: 28rem; height: 100%; padding: 1.5rem 0.5rem; box-sizing: border-box; position: relative; border-right: 1px solid rgba(255,255,255,0.03); display: flex; flex-direction: column; }' +
            '.home-tv-channels-wrap .scroll { height: 100%; }' +
            '.home-tv-channel-row { display: flex; align-items: center; margin-bottom: 0.6rem; width: 100%; padding: 0 0.5rem; box-sizing: border-box; }' +
            '.home-tv-card { flex: 1; height: 4.2rem; background: rgba(255,255,255,0.03); border: 2px solid transparent; border-radius: 0.6rem; display: flex; align-items: center; justify-content: flex-start; cursor: pointer; padding: 0.5rem 1rem; box-sizing: border-box; gap: 1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }' +
            '.home-tv-card.focus { border-color: #fff; background: rgba(255,255,255,0.15); transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 4.5rem; height: 2.6rem; background-size: contain; background-repeat: no-repeat; background-position: center; background-color: rgba(0,0,0,0.2); border-radius: 0.3rem; flex-shrink: 0; padding: 0.2rem; box-sizing: border-box; }' +
            '.home-tv-card__title { font-size: 1.1rem; font-weight: 500; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }' +
            '.home-tv-card.focus .home-tv-card__title { color: #fff; font-weight: bold; }' +
            
            /* Правая колонка: Программа передач (EPG) с таймлайном */
            '.home-tv-info { flex: 1; padding: 2.5rem 2rem; display: flex; flex-direction: column; box-sizing: border-box; overflow-y: auto; background: rgba(0,0,0,0.05); }' +
            '.home-tv-info__group { font-size: 0.9rem; color: #ff9800; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }' +
            '.home-tv-info__title { font-size: 2rem; font-weight: bold; color: #fff; margin-bottom: 1.8rem; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }' +
            '.home-tv-info__epg { display: flex; flex-direction: column; gap: 0.8rem; }' +
            '.home-tv-epg-item { display: flex; flex-direction: column; padding: 0.8rem 1rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; border-left: 4px solid rgba(255,255,255,0.15); position: relative; }' +
            '.home-tv-epg-item.current { background: rgba(243, 156, 18, 0.06); border-left-color: #f39c12; }' +
            '.home-tv-epg-time { font-size: 0.85rem; color: #aaa; font-family: monospace; margin-bottom: 0.3rem; display: flex; justify-content: space-between; }' +
            '.home-tv-epg-item.current .home-tv-epg-time { color: #f39c12; font-weight: bold; }' +
            '.home-tv-epg-name { font-size: 0.95rem; color: #fff; line-height: 1.3; }' +
            '.home-tv-epg-timeline { height: 3px; background: rgba(255,255,255,0.1); width: 100%; margin-top: 0.5rem; border-radius: 2px; overflow: hidden; }' +
            '.home-tv-epg-progress { height: 100%; background: #f39c12; width: 45%; }' + /* Статический или расчетный прогресс */
            '.home-tv-loading { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 1.2rem; color: #666; }' +
        '</style>').appendTo('body');
    }

    // 2. Инициализация и генерация уникального UID (из download.js)
    var UID = Lampa.Storage.get('home_tv_uid', '');
    if (!UID) {
        UID = Lampa.Utils.uid(10).toUpperCase().replace(/(.{4})/g, '$1-');
        if (UID.endsWith('-')) UID = UID.slice(0, -1);
        Lampa.Storage.set('home_tv_uid', UID);
    }

    // 3. Компонент HOME TV
    Lampa.Component.add('home_tv', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-container"></div>');
        var scroll_inner = $('<div></div>');
        scroll.append(scroll_inner);

        var groups = [];
        var active_group_index = 0;
        var last_focused_card = null;
        var current_column = 'sidebar'; // 'sidebar' или 'channels'

        var sidebar = $('<div class="home-tv-sidebar"><div class="home-tv-sidebar__title">HOME TV</div><div class="home-tv-sidebar-list"></div></div>');
        var channelsWrap = $('<div class="home-tv-channels-wrap"></div>');
        var infoPanel = $('<div class="home-tv-info">' +
            '<div class="home-tv-info__group">-</div>' +
            '<div class="home-tv-info__title">-</div>' +
            '<div class="home-tv-info__epg"></div>' +
        '</div>');

        html.append(sidebar).append(channelsWrap).append(infoPanel);
        channelsWrap.append(scroll.render(true));

        this.render = function () { 
            return html; 
        };

        // Загрузка списков с ограничением количества каналов (max_ch_in_group)
        var loadPlaylists = function (callback) {
            var maxChannels = Lampa.Storage.get('home_tv_max_ch', '300');
            maxChannels = parseInt(maxChannels) || 300;

            var playlistUrls = [
                { title: 'Основные', url: 'https://raw.githubusercontent.com/Dmitriy11223455/iptv-autoupdate/refs/heads/main/playlist.m3u' },
                { title: 'Развлекательные', url: 'https://raw.githubusercontent.com/smolnp/IPTVru/refs/heads/gh-pages/IPTVru.m3u' },
                { title: 'Кино и Спорт', url: 'https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ru_televizor24.m3u' }
            ];

            var loadedCount = 0;
            var tempGroups = {};

            playlistUrls.forEach(function (source) {
                $.ajax({
                    url: source.url,
                    method: 'GET',
                    dataType: 'text',
                    timeout: 10000,
                    success: function (data) {
                        parseM3U(data, source.title, tempGroups, maxChannels);
                    },
                    complete: function () {
                        loadedCount++;
                        if (loadedCount === playlistUrls.length) {
                            finalizeGroups(tempGroups, callback);
                        }
                    }
                });
            });
        };

        var parseM3U = function (text, defaultCategory, tempGroups, maxChannels) {
            var lines = text.split('\n');
            var currentChannel = null;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.startsWith('#EXTINF:')) {
                    currentChannel = {};
                    
                    var tvgLogoMatch = line.match(/tvg-logo="([^"]+)"/i);
                    currentChannel.img = tvgLogoMatch ? tvgLogoMatch[1] : '';

                    var groupMatch = line.match(/group-title="([^"]+)"/i);
                    var category = groupMatch ? groupMatch[1] : defaultCategory;

                    var commaIndex = line.lastIndexOf(',');
                    currentChannel.title = commaIndex > -1 ? line.substring(commaIndex + 1).trim() : 'Без названия';
                    currentChannel.category = category;
                } else if (line.startsWith('http') && currentChannel) {
                    currentChannel.url = line;
                    
                    if (!tempGroups[currentChannel.category]) {
                        tempGroups[currentChannel.category] = [];
                    }
                    
                    if (tempGroups[currentChannel.category].length < maxChannels) {
                        if (!tempGroups[currentChannel.category].some(function(c){ return c.title === currentChannel.title; })) {
                            tempGroups[currentChannel.category].push(currentChannel);
                        }
                    }
                    currentChannel = null;
                }
            }
        };

        var finalizeGroups = function (tempGroups, callback) {
            var allChannels = [];
            groups = [];

            Object.keys(tempGroups).forEach(function (catName) {
                var channels = tempGroups[catName];
                allChannels = allChannels.concat(channels);
                groups.push({
                    title: catName,
                    channels: channels,
                    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
                });
            });

            if (allChannels.length > 0) {
                groups.unshift({
                    title: 'Все каналы',
                    channels: allChannels,
                    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>'
                });
            }

            callback();
        };

        // Генерация таймлайна программы передач (EPG)
        var updateEPG = function (channel) {
            var epgContainer = infoPanel.find('.home-tv-info__epg');
            epgContainer.empty();

            var now = new Date();
            var hours = now.getHours();

            var mockEPG = [
                { time: (hours) + ':00', name: 'Сейчас в эфире: Главные события дня и аналитика', current: true },
                { time: (hours + 1) + ':15', name: 'Марафон популярных развлекательных передач', current: false },
                { time: (hours + 3) + :30', name: 'Художественный фильм вечернего эфира', current: false }
            ];

            mockEPG.forEach(function (item) {
                var timelineHtml = item.current ? '<div class="home-tv-epg-timeline"><div class="home-tv-epg-progress"></div></div>' : '';
                var epgRow = $('<div class="home-tv-epg-item' + (item.current ? ' current' : '') + '">' +
                    '<div class="home-tv-epg-time"><span>' + item.time + '</span>' + (item.current ? '<span>В ЭФИРЕ</span>' : '') + '</div>' +
                    '<div class="home-tv-epg-name">' + item.name + '</div>' +
                    timelineHtml +
                '</div>');
                epgContainer.append(epgRow);
            });
        };

        var showChannels = function (group) {
            scroll_inner.empty();

            group.channels.forEach(function (channel, index) {
                var logoStyle = channel.img ? 'background-image: url(' + channel.img + ')' : 'background-color: rgba(255,255,255,0.05)';
                
                var row = $('<div class="home-tv-channel-row">' +
                    '<div class="home-tv-card selector" data-index="' + index + '">' +
                        '<div class="home-tv-card__icon" style="' + logoStyle + '"></div>' +
                        '<div class="home-tv-card__title">' + channel.title + '</div>' +
                    '</div>' +
                '</div>');

                var card = row.find('.home-tv-card');

                card.on('hover:focus', function () {
                    last_focused_card = $(this);
                    scroll.update($(this)); 
                    infoPanel.find('.home-tv-info__group').text(group.title);
                    infoPanel.find('.home-tv-info__title').text(channel.title);
                    updateEPG(channel);
                });

                card.on('hover:enter', function () {
                    Lampa.Player.play({ 
                        url: channel.url, 
                        title: channel.title,
                        headers: {
                            'Referer': 'https://mediavitrina.ru',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                        }
                    });
                });

                scroll_inner.append(row);
            });
        };

        this.create = function () {
            sidebar.find('.home-tv-sidebar-list').html('<div class="home-tv-loading">Загрузка...</div>');

            loadPlaylists(function () {
                var sidebarList = sidebar.find('.home-tv-sidebar-list');
                sidebarList.empty();

                if (groups.length === 0) {
                    sidebarList.html('<div class="home-tv-loading">Пусто</div>');
                    return;
                }

                groups.forEach(function (group, idx) {
                    var sItem = $('<div class="home-tv-sidebar-item selector" data-group-index="' + idx + '">' +
                        '<div class="home-tv-sidebar-item__left">' +
                            '<span class="home-tv-sidebar-item__icon">' + group.icon + '</span>' +
                            '<span class="home-tv-sidebar-item__text">' + group.title + '</span>' +
                        '</div>' +
                        '<div class="home-tv-sidebar-item__count">' + group.channels.length + '</div>' +
                    '</div>');

                    sItem.on('hover:focus', function () {
                        active_group_index = idx;
                        showChannels(group);
                    });

                    sidebarList.append(sItem);
                });

                showChannels(groups[0]);
            });

            return this.render();
        };

        // Полная адаптация D-Pad под TV пульты
        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () { 
                    Lampa.Controller.collectionSet(html); 
                    if (current_column === 'sidebar') {
                        Lampa.Controller.collectionFocus(sidebar.find('.home-tv-sidebar-item')[active_group_index], html);
                    } else if (last_focused_card) {
                        Lampa.Controller.collectionFocus(last_focused_card[0], html);
                    }
                },
                up: function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                left: function () { 
                    if (current_column === 'channels') {
                        current_column = 'sidebar';
                        Lampa.Controller.collectionFocus(sidebar.find('.home-tv-sidebar-item')[active_group_index], html);
                    } else {
                        Lampa.Controller.move('left');
                    }
                },
                right: function () { 
                    if (current_column === 'sidebar') {
                        var targetCard = scroll_inner.find('.home-tv-card')[0];
                        if (targetCard) {
                            current_column = 'channels';
                            Lampa.Controller.collectionFocus(targetCard, html);
                        }
                    } else {
                        Lampa.Controller.move('right');
                    }
                },
                back: function () { Lampa.Activity.backward(); }
            });
            
            Lampa.Controller.toggle('home_tv_ctrl');
        };

        this.create();
    });

    // 4. Добавление пункта HOME TV в меню
    function addPluginMenuItem() {
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;
        
        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/>' +
                '</svg>' +
            '</div>' +
            '<div class="menu__text">HOME TV</div>' +
        '</li>');
        
        menu_item.on('hover:enter click', function () {
            Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv', page: 1 });
        });
        
        $('.menu .menu__list').append(menu_item);
    }

    // 5. Создание вкладки настроек внутри Lampa (в точности как в kuliklite)
    function addSettingsMenu() {
        Lampa.Settings.add({
            title: 'HOME TV',
            component: 'home_tv_settings',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect></svg>',
            onRender: function (panel) {
                var menu = [
                    {
                        title: 'Лимит каналов',
                        description: 'Максимальное количество каналов в одной группе плейлиста',
                        type: 'select',
                        name: 'home_tv_max_ch',
                        values: { '60': '60', '120': '120', '180': '180', '300': '300', '1000': 'Все' },
                        default: '300'
                    },
                    {
                        title: 'Ваш Идентификатор (UID)',
                        description: UID,
                        type: 'static'
                    }
                ];

                menu.forEach(function (item) {
                    var el = $('<div class="settings-param selector">' +
                        '<div class="settings-param__name">' + item.title + '</div>' +
                        '<div class="settings-param__descr">' + (item.description || '') + '</div>' +
                    '</div>');

                    if (item.type === 'select') {
                        var currentVal = Lampa.Storage.get(item.name, item.default);
                        el.append('<div class="settings-param__value">' + item.values[currentVal] + '</div>');
                        
                        el.on('hover:enter click', function () {
                            var options = [];
                            Object.keys(item.values).forEach(function(k) {
                                options.push({ title: item.values[k], value: k });
                            });

                            Lampa.Select.show({
                                title: item.title,
                                items: options,
                                onSelect: function (selected) {
                                    Lampa.Storage.set(item.name, selected.value);
                                    el.find('.settings-param__value').text(selected.title);
                                }
                            });
                        });
                    }
                    panel.append(el);
                });
            }
        });
    }

    Lampa.Listener.follow('app', function (e) { 
        if (e.type == 'ready') {
            addPluginMenuItem();
            addSettingsMenu();
        }
    });

})();
