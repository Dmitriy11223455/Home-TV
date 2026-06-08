;(function () {
    'use strict';

    var plugin = {
        component: 'home_tv',
        name: 'HOME TV',
        version: '1.1.5'
    };

    // 1. Жесткие стили с абсолютным позиционированием колонок (чтобы ничего не съезжало)
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-container { width: 100% !important; height: 100% !important; background: #141414 !important; position: absolute !important; left: 0 !important; top: 0 !important; right: 0 !important; bottom: 0 !important; overflow: hidden !important; z-index: 9999 !important; box-sizing: border-box; font-family: Roboto, Arial, sans-serif; }' +
            
            /* Левая колонка — Категории фиксировано слева */
            '.home-tv-sidebar { position: absolute !important; left: 0 !important; top: 0 !important; bottom: 0 !important; width: 18rem !important; padding: 2rem 1rem !important; display: flex !important; flex-direction: column !important; border-right: 1px solid rgba(255,255,255,0.08) !important; background: rgba(0,0,0,0.4) !important; box-sizing: border-box !important; }' +
            '.home-tv-sidebar__title { font-size: 1.8rem; font-weight: bold; margin-bottom: 2rem; padding-left: 0.5rem; color: #fff; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }' +
            '.home-tv-sidebar-list { display: flex !important; flex-direction: column !important; gap: 0.4rem !important; overflow-y: auto !important; flex: 1 !important; }' +
            '.home-tv-sidebar-item { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 0.9rem 1.2rem !important; border-radius: 0.6rem !important; cursor: pointer; color: #a0a0a0; font-size: 1.1rem; box-sizing: border-box !important; }' +
            '.home-tv-sidebar-item__left { display: flex !important; align-items: center !important; gap: 1rem !important; }' +
            '.home-tv-sidebar-item__icon { display: flex !important; align-items: center !important; opacity: 0.6; color: #fff; }' +
            '.home-tv-sidebar-item__icon svg { width: 1.3rem; height: 1.3rem; }' +
            '.home-tv-sidebar-item.focus { background: #fff !important; color: #000 !important; font-weight: bold !important; }' +
            '.home-tv-sidebar-item.focus .home-tv-sidebar-item__icon { opacity: 1 !important; color: #000 !important; }' +
            '.home-tv-sidebar-item__count { font-size: 0.9rem; opacity: 0.5; font-family: monospace; }' +
            
            /* Средняя колонка — Каналы строго по центру */
            '.home-tv-channels-wrap { position: absolute !important; left: 18rem !important; top: 0 !important; bottom: 0 !important; width: 26rem !important; padding: 2rem 0.8rem !important; box-sizing: border-box !important; border-right: 1px solid rgba(255,255,255,0.04) !important; background: rgba(0,0,0,0.1) !important; display: flex !important; flex-direction: column !important; }' +
            '.home-tv-channels-wrap .scroll { height: 100% !important; width: 100% !important; }' +
            '.home-tv-channel-row { display: flex !important; align-items: center !important; margin-bottom: 0.8rem !important; width: 100% !important; box-sizing: border-box !important; padding: 0 0.4rem !important; }' +
            '.home-tv-card { flex: 1 !important; height: 4.8rem !important; background: rgba(255,255,255,0.03) !important; border: 2px solid transparent !important; border-radius: 0.8rem !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; cursor: pointer; padding: 0.6rem 1.2rem !important; box-sizing: border-box !important; gap: 1.2rem !important; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s; }' +
            '.home-tv-card.focus { border-color: #fff !important; background: rgba(255,255,255,0.15) !important; transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 4.8rem !important; height: 2.8rem !important; background-size: contain !important; background-repeat: no-repeat !important; background-position: center !important; background-color: rgba(0,0,0,0.3) !important; border-radius: 0.4rem !important; flex-shrink: 0 !important; padding: 0.2rem; box-sizing: border-box; }' +
            '.home-tv-card__title { font-size: 1.15rem; font-weight: 500; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }' +
            '.home-tv-card.focus .home-tv-card__title { font-weight: bold; }' +
            
            /* Правая колонка — Занимает всю оставшуюся область справа */
            '.home-tv-info { position: absolute !important; left: 44rem !important; top: 0 !important; bottom: 0 !important; right: 0 !important; padding: 3rem 2.5rem !important; display: flex !important; flex-direction: column !important; box-sizing: border-box !important; overflow-y: auto !important; background: rgba(0,0,0,0.2) !important; }' +
            '.home-tv-info__group { font-size: 0.95rem; color: #ff9800; margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }' +
            '.home-tv-info__title { font-size: 2.2rem; font-weight: bold; color: #fff; margin-bottom: 2rem; line-height: 1.2; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }' +
            '.home-tv-info__epg { display: flex !important; flex-direction: column !important; gap: 0.9rem !important; }' +
            '.home-tv-epg-item { display: flex !important; flex-direction: column !important; padding: 0.9rem 1.2rem !important; background: rgba(255,255,255,0.02) !important; border-radius: 0.6rem !important; border-left: 4px solid rgba(255,255,255,0.15) !important; position: relative; box-sizing: border-box !important; }' +
            '.home-tv-epg-item.current { background: rgba(243, 156, 18, 0.07) !important; border-left-color: #f39c12 !important; }' +
            '.home-tv-epg-time { font-size: 0.9rem; color: #aaa; font-family: monospace; margin-bottom: 0.4rem; display: flex !important; justify-content: space-between !important; width: 100% !important; }' +
            '.home-tv-epg-item.current .home-tv-epg-time { color: #f39c12 !important; font-weight: bold !important; }' +
            '.home-tv-epg-name { font-size: 1rem; color: #fff; line-height: 1.4; }' +
            '.home-tv-epg-timeline { height: 4px; background: rgba(255,255,255,0.1); width: 100%; margin-top: 0.6rem; border-radius: 2px; overflow: hidden; }' +
            '.home-tv-epg-progress { height: 100%; background: #f39c12; width: 50%; }' +
            '.home-tv-loading { display: flex !important; width: 100% !important; height: 100% !important; align-items: center !important; justify-content: center !important; font-size: 1.3rem; color: #777; font-weight: 500; }' +
        '</style>').appendTo('body');
    }

    // 2. Генерация UID устройства
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
        var current_column = 'sidebar';

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

        var updateEPG = function (channel) {
            var epgContainer = infoPanel.find('.home-tv-info__epg');
            epgContainer.empty();

            var now = new Date();
            var hours = now.getHours();

            var mockEPG = [
                { time: (hours) + ':00', name: 'Сейчас в эфире: Главные события дня, подробные репортажи и аналитика', current: true },
                { time: (hours + 1) + ':15', name: 'Дневной интерактивный эфир и обсуждение актуальных тем', current: false },
                { time: (hours + 3) + ':00', name: 'Художественный фильм / Киносериал', current: false }
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
                var logoStyle = channel.img ? 'background-image: url(' + channel.img + ')' : 'background-color: rgba(255,255,255,0.06)';
                
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
            
            scroll.step();
        };

        this.create = function () {
            sidebar.find('.home-tv-sidebar-list').html('<div class="home-tv-loading">Загрузка...</div>');

            loadPlaylists(function () {
                var sidebarList = sidebar.find('.home-tv-sidebar-list');
                sidebarList.empty();

                if (groups.length === 0) {
                    sidebarList.html('<div class="home-tv-loading">Списки пусты</div>');
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

    // 4. Меню Лампы
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

    // 5. Настройки
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
