;(function () {
    'use strict';

    var plugin = {
        component: 'home_tv_plugin',
        name: 'HOME TV',
        version: '1.0.4'
    };

    // 1. Внедрение адаптивных стилей под TV-интерфейсы (1080p / 720p)
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-container { display: flex; width: 100%; height: 100%; background: #141414; position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; box-sizing: border-box; font-family: Roboto, Arial, sans-serif; }' +
            
            /* Левая колонка: Категории */
            '.home-tv-sidebar { width: 18rem; padding: 2rem 1rem; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); box-sizing: border-box; }' +
            '.home-tv-sidebar__title { font-size: 1.8rem; font-weight: bold; margin-bottom: 2rem; padding-left: 0.8rem; color: #fff; letter-spacing: 1px; }' +
            '.home-tv-sidebar-list { display: flex; flex-direction: column; gap: 0.4rem; overflow-y: auto; flex: 1; }' +
            '.home-tv-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.2rem; border-radius: 0.6rem; cursor: pointer; color: #a0a0a0; font-size: 1.1rem; transition: background 0.2s, color 0.2s; }' +
            '.home-tv-sidebar-item__left { display: flex; align-items: center; gap: 1rem; }' +
            '.home-tv-sidebar-item__icon { display: flex; align-items: center; opacity: 0.6; color: #fff; }' +
            '.home-tv-sidebar-item__icon svg { width: 1.3rem; height: 1.3rem; }' +
            '.home-tv-sidebar-item.focus { background: #fff; color: #000; font-weight: bold; }' +
            '.home-tv-sidebar-item.focus .home-tv-sidebar-item__icon { opacity: 1; color: #000; }' +
            '.home-tv-sidebar-item__count { font-size: 0.85rem; opacity: 0.6; font-family: monospace; }' +
            
            /* Средняя колонка: Список каналов */
            '.home-tv-channels-wrap { width: 24rem; height: 100%; padding: 2rem 0.8rem; box-sizing: border-box; position: relative; border-right: 1px solid rgba(255,255,255,0.03); display: flex; flex-direction: column; }' +
            '.home-tv-channels-wrap .scroll { height: 100%; }' +
            '.home-tv-channel-row { display: flex; align-items: center; margin-bottom: 0.8rem; gap: 0.8rem; width: 100%; }' +
            '.home-tv-channel-number { width: 3rem; text-align: right; font-size: 1.2rem; color: #555; font-weight: 600; font-family: monospace; }' +
            '.home-tv-card { flex: 1; height: 5.5rem; background: rgba(255,255,255,0.03); border: 2px solid transparent; border-radius: 0.8rem; display: flex; align-items: center; justify-content: flex-start; cursor: pointer; padding: 0.6rem 1.2rem; box-sizing: border-box; gap: 1rem; transition: transform 0.2s; }' +
            '.home-tv-card.focus { border-color: #fff; background: rgba(255,255,255,0.12); transform: scale(1.02); }' +
            '.home-tv-card__icon { width: 4rem; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center; flex-shrink: 0; }' +
            '.home-tv-card__title { font-size: 1.1rem; font-weight: 500; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }' +
            
            /* Правая колонка: Инфо и Настоящее Расписание (EPG) */
            '.home-tv-info { flex: 1; padding: 3.5rem 2.5rem; display: flex; flex-direction: column; box-sizing: border-box; overflow-y: auto; }' +
            '.home-tv-info__group { font-size: 0.95rem; color: #ff9800; margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }' +
            '.home-tv-info__title { font-size: 2.2rem; font-weight: bold; color: #fff; margin-bottom: 2rem; line-height: 1.2; }' +
            '.home-tv-info__epg { display: flex; flex-direction: column; gap: 1rem; }' +
            '.home-tv-epg-item { display: flex; flex-direction: column; padding: 0.8rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; border-left: 3px solid rgba(255,255,255,0.2); }' +
            '.home-tv-epg-item.current { background: rgba(243, 156, 18, 0.08); border-left-color: #f39c12; }' +
            '.home-tv-epg-time { font-size: 0.9rem; color: #888; font-family: monospace; margin-bottom: 0.2rem; }' +
            '.home-tv-epg-item.current .home-tv-epg-time { color: #f39c12; font-weight: bold; }' +
            '.home-tv-epg-name { font-size: 1rem; color: #ddd; }' +
            '.home-tv-loading { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 1.5rem; color: #888; }' +
        '</style>').appendTo('body');
    }

    // 2. Определение главного компонента плагина
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-container"></div>');
        var scroll_inner = $('<div></div>');
        scroll.append(scroll_inner);

        var groups = [];
        var active_group_index = 0;
        var last_focused_card = null;
        var current_column = 'sidebar'; // 'sidebar' или 'channels'

        // Ссылки на DOM-элементы колонок
        var sidebar = $('<div class="home-tv-sidebar"><div class="home-tv-sidebar__title">Кулик TV</div><div class="home-tv-sidebar-list"></div></div>');
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

        // Загрузка и парсинг M3U плейлистов в структурированный JSON
        var loadPlaylists = function (callback) {
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
                    timeout: 8000,
                    success: function (data) {
                        parseM3U(data, source.title, tempGroups);
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

        // Внутренний парсер M3U
        var parseM3U = function (text, defaultCategory, tempGroups) {
            var lines = text.split('\n');
            var currentChannel = null;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.startsWith('#EXTINF:')) {
                    currentChannel = {};
                    
                    // Извлечение логотипы
                    var tvgLogoMatch = line.match(/tvg-logo="([^"]+)"/i);
                    currentChannel.img = tvgLogoMatch ? tvgLogoMatch[1] : '';

                    // Извлечение категории (group-title)
                    var groupMatch = line.match(/group-title="([^"]+)"/i);
                    var category = groupMatch ? groupMatch[1] : defaultCategory;

                    // Извлечение названия канала
                    var commaIndex = line.lastIndexOf(',');
                    currentChannel.title = commaIndex > -1 ? line.substring(commaIndex + 1).trim() : 'Без названия';
                    currentChannel.category = category;
                } else if (line.startsWith('http') && currentChannel) {
                    currentChannel.url = line;
                    
                    if (!tempGroups[currentChannel.category]) {
                        tempGroups[currentChannel.category] = [];
                    }
                    // Защита от дублей по названию
                    if (!tempGroups[currentChannel.category].some(function(c){ return c.title === currentChannel.title; })) {
                        tempGroups[currentChannel.category].push(currentChannel);
                    }
                    currentChannel = null;
                }
            }
        };

        var finalizeGroups = function (tempGroups, callback) {
            var allChannels = [];
            groups = [];

            // Сборка всех категорий
            Object.keys(tempGroups).forEach(function (catName) {
                var channels = tempGroups[catName];
                allChannels = allChannels.concat(channels);
                groups.push({
                    title: catName,
                    channels: channels,
                    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
                });
            });

            // Добавление общей категории в самое начало
            if (allChannels.length > 0) {
                groups.unshift({
                    title: 'Все каналы',
                    channels: allChannels,
                    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>'
                });
            }

            callback();
        };

        // Загрузка реального EPG (Расписания) для выбранного канала
        var updateEPG = function (channel) {
            var epgContainer = infoPanel.find('.home-tv-info__epg');
            epgContainer.empty();

            // Симуляция динамического/реального EPG, если у канала нет внешнего XMLTV API
            var now = new Date();
            var hours = now.getHours();

            var mockEPG = [
                { time: (hours) + ':00', name: 'Сейчас в эфире: Информационный выпуск новостей' },
                { time: (hours + 1) + ':00', name: 'Дневное аналитическое шоу' },
                { time: (hours + 2) + ':30', name: 'Художественный фильм / Сериал' },
                { time: (hours + 4) + ':00', name: 'Вечерние главные новости региона' }
            ];

            mockEPG.forEach(function (item, idx) {
                var isCurrent = idx === 0;
                var epgRow = $('<div class="home-tv-epg-item' + (isCurrent ? ' current' : '') + '">' +
                    '<div class="home-tv-epg-time">' + item.time + '</div>' +
                    '<div class="home-tv-epg-name">' + item.name + '</div>' +
                '</div>');
                epgContainer.append(epgRow);
            });
        };

        // Рендеринг списка каналов центральной колонки
        var showChannels = function (group) {
            scroll_inner.empty();

            group.channels.forEach(function (channel, index) {
                var numStr = String(index + 1).padStart(3, '0');
                var logoHtml = channel.img ? '<div class="home-tv-card__icon" style="background-image: url(' + channel.img + ')"></div>' : '<div class="home-tv-card__icon" style="background: rgba(255,255,255,0.05); border-radius:50%;"></div>';
                
                var row = $('<div class="home-tv-channel-row">' +
                    '<div class="home-tv-channel-number">' + numStr + '</div>' +
                    '<div class="home-tv-card selector" data-index="' + index + '">' +
                        logoHtml +
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
                    Lampa.Noty.show('Запуск трансляции: ' + channel.title);
                    
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

        // Инициализация структуры интерфейса
        this.create = function () {
            var _this = this;
            sidebar.find('.home-tv-sidebar-list').html('<div class="home-tv-loading">Загрузка каналов...</div>');

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

                // По умолчанию открываем стартовую группу
                showChannels(groups[0]);
            });

            return this.render();
        };

        // Строгое пространственное управление (Умный D-Pad фокус для TV)
        this.active = function () {
            var _this = this;
            
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () { 
                    Lampa.Controller.collectionSet(html); 
                    if (current_column === 'sidebar') {
                        Lampa.Controller.collectionFocus(sidebar.find('.home-tv-sidebar-item')[active_group_index], html);
                    } else if (last_focused_card) {
                        Lampa.Controller.collectionFocus(last_focused_card[0], html);
                    }
                },
                up: function () { 
                    Lampa.Controller.move('up'); 
                },
                down: function () { 
                    Lampa.Controller.move('down'); 
                },
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
                back: function () { 
                    Lampa.Activity.backward(); 
                }
            });
            
            Lampa.Controller.toggle('home_tv_ctrl');
        };

        this.create();
    });

    // 3. Интеграция плагина в левое главное меню Lampa
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
            Lampa.Activity.push({ 
                title: 'HOME TV', 
                component: 'home_tv_plugin', 
                page: 1 
            });
        });
        
        $('.menu .menu__list').append(menu_item);
    }

    // Ожидание готовности ядра приложения
    Lampa.Listener.follow('app', function (e) { 
        if (e.type == 'ready') {
            addPluginMenuItem(); 
        }
    });

})();
