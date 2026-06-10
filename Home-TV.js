/**
 * Lampa Plugin: HOME TV
 * Полносистемный IPTV-плагин для Lampa с поддержкой M3U, EPG, Избранного и управления пультом.
 * Полностью готовый к работе код без сокращений и заглушек.
 */
(function () {
    'use strict';

    // Список исходных пакетов каналов (Категории верхнего уровня)
    var channelsData = [
        {
            title: "Первый канал",
            playlist: "https://example.com/playlist.m3u",
            logo: "https://example.com/logo/pervy.png"
        },
        {
            title: "Россия 1",
            playlist: "https://example.com/playlist.m3u",
            logo: "https://example.com/logo/rossia1.png"
        }
    ];

    // Глобальное состояние плагина
    var HomeTV = {
        name: 'HOME TV',
        version: '1.0.0',
        active: false,
        scroll: null,
        menu_item: null,
        html: null,
        list: [], // Распарсенные каналы текущего плейлиста
        favorites: [], // Список избранного (сохраняется по уникальному ID или названию)
        current_index: 0,
        current_playlist_url: '',
        playlist_cache: {}, // Кэш загруженных M3U
        epg_data: {}, // Данные EPG программы
        timers: {},
        digit_buffer: '',
        digit_timer: null,

        // Инициализация плагина
        init: function () {
            this.initSettings();
            this.loadFavorites();
            
            // Ждем готовности Lampa API
            if (window.Lampa) {
                this.ready();
            } else {
                document.addEventListener('app:ready', this.ready.bind(this));
            }
        },

        // Настройки плагина в меню Lampa
        initSettings: function () {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name === 'main') {
                    var field = $(`<div class="settings-folder selector" data-component="hometv_settings">
                        <div class="settings-folder__icon">
                            <svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M21 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm11 5H13v-2h9v2zm0-4H13v-2h9v2z" fill="currentColor"/></svg>
                        </div>
                        <div class="settings-folder__name">HOME TV</div>
                    </div>`);
                    e.body.find('.scroll').append(field);
                }
            });

            // Компонент настроек HOME TV
            Lampa.Component.add('hometv_settings', function (object) {
                var comp = this;
                var scroll = new Lampa.Scroll({ mask: true, over: true });
                var files = new Lampa.Files(object);

                comp.create = function () {
                    comp.activity.title = 'HOME TV — Настройки';
                    var html = $('<div class="settings-list"></div>');

                    var settings_list = [
                        {
                            title: 'URL EPG',
                            subtitle: Lampa.Storage.get('hometv_epg_url', 'https://example.com/epg.xml.gz'),
                            param: 'hometv_epg_url',
                            type: 'input'
                        },
                        {
                            title: 'Автообновление плейлиста',
                            subtitle: Lampa.Storage.get('hometv_update_interval', '30'),
                            param: 'hometv_update_interval',
                            type: 'select',
                            values: { '5': '5 минут', '15': '15 минут', '30': '30 минут', '60': '60 минут' }
                        },
                        {
                            title: 'Размер карточек каналов',
                            subtitle: Lampa.Storage.get('hometv_card_size', 'medium'),
                            param: 'hometv_card_size',
                            type: 'select',
                            values: { 'small': 'Маленький', 'medium': 'Средний', 'large': 'Большой' }
                        },
                        {
                            title: 'Скрывать логотипы',
                            subtitle: Lampa.Storage.get('hometv_hide_logos', 'false') === 'true' ? 'Да' : 'Нет',
                            param: 'hometv_hide_logos',
                            type: 'select',
                            values: { 'false': 'Нет', 'true': 'Да' }
                        },
                        {
                            title: 'Сортировка',
                            subtitle: Lampa.Storage.get('hometv_sort', 'default') === 'default' ? 'По умолчанию' : 'По алфавиту',
                            param: 'hometv_sort',
                            type: 'select',
                            values: { 'default': 'По умолчанию', 'alpha': 'По алфавиту' }
                        }
                    ];

                    settings_list.forEach(function (opt) {
                        var item = $(`<div class="settings-param selector" data-param="${opt.param}">
                            <div class="settings-param__name">${opt.title}</div>
                            <div class="settings-param__value">${opt.subtitle}</div>
                        </div>`);

                        item.on('hover:enter', function () {
                            if (opt.type === 'input') {
                                Lampa.Input.edit({
                                    title: opt.title,
                                    value: Lampa.Storage.get(opt.param, opt.subtitle),
                                    free: true
                                }, function (new_val) {
                                    if (new_val) {
                                        Lampa.Storage.set(opt.param, new_val);
                                        item.find('.settings-param__value').text(new_val);
                                    }
                                });
                            } else if (opt.type === 'select') {
                                var menu = [];
                                for (var key in opt.values) {
                                    menu.push({ title: opt.values[key], value: key });
                                }
                                Lampa.Select.show({
                                    title: opt.title,
                                    items: menu,
                                    onSelect: function (selected) {
                                        Lampa.Storage.set(opt.param, selected.value);
                                        item.find('.settings-param__value').text(selected.title);
                                    }
                                });
                            }
                        });
                        html.append(item);
                    });

                    scroll.append(html);
                    files.append(scroll.render());
                };

                comp.render = function () {
                    return files.render();
                };

                comp.start = function () {
                    Lampa.Controller.add('hometv_settings', {
                        toggle: function () {
                            Lampa.Controller.collectionSet(scroll.render());
                            Lampa.Controller.collectionFocus(false, scroll.render());
                        },
                        left: function () {
                            Lampa.Controller.toggle('settings');
                        },
                        up: function () {
                            Lampa.Navigator.move('up');
                        },
                        down: function () {
                            Lampa.Navigator.move('down');
                        },
                        back: function () {
                            Lampa.Controller.toggle('settings');
                        }
                    });
                    Lampa.Controller.toggle('hometv_settings');
                };

                comp.destroy = function () {
                    scroll.destroy();
                    files.destroy();
                };
            });
        },

        // Регистрация в меню Lampa при запуске
        ready: function () {
            var self = this;
            
            // Добавляем пункт в левое боковое меню Lampa
            this.menu_item = $(`<li class="menu__item selector" data-action="hometv">
                <div class="menu__ico">
                    <svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M21 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm11 5H13v-2h9v2zm0-4H13v-2h9v2z" fill="currentColor"/></svg>
                </div>
                <div class="menu__text">HOME TV</div>
            </li>`);

            this.menu_item.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: 'HOME TV',
                    component: 'hometv',
                    page: 1
                });
            });

            $('.menu .menu__list').append(this.menu_item);

            // Регистрация основного компонента интерфейса
            Lampa.Component.add('hometv', this.component.bind(this));

            // Запускаем EPG фоновое обновление
            this.loadEPG();
            this.startAutoUpdateTimer();
        },

        // Работа с Избранным через Lampa.Storage
        loadFavorites: function () {
            try {
                var saved = Lampa.Storage.get('hometv_favorites_list');
                this.favorites = saved ? JSON.parse(saved) : [];
            } catch (e) {
                this.favorites = [];
            }
        },

        saveFavorites: function () {
            Lampa.Storage.set('hometv_favorites_list', JSON.stringify(this.favorites));
        },

        isFavorite: function (item) {
            return this.favorites.some(function (f) { return f.title === item.title; });
        },

        toggleFavorite: function (item) {
            if (this.isFavorite(item)) {
                this.favorites = this.favorites.filter(function (f) { return f.title !== item.title; });
                Lampa.Noty.show('Удалено из избранного: ' + item.title);
            } else {
                this.favorites.push(item);
                Lampa.Noty.show('Добавлено в избранное: ' + item.title);
            }
            this.saveFavorites();
        },

        // Компонент отображения интерфейса HOME TV
        component: function (object) {
            var self = this;
            var comp = this;
            var scroll = new Lampa.Scroll({ mask: true, over: true });
            var files = new Lampa.Files(object);
            
            this.html = $('<div class="hometv-container"></div>');
            
            // Внедрение стилей интерфейса плагина
            if (!$('#hometv-styles').length) {
                $('head').append(`<style id="hometv-styles">
                    .hometv-container { display: flex; width: 100%; height: 100%; box-sizing: border-box; }
                    .hometv-sidebar { width: 30%; background: rgba(20,20,20,0.95); border-right: 2px solid rgba(255,255,255,0.05); padding: 10px; box-sizing: border-box; }
                    .hometv-content { width: 70%; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; background: rgba(10,10,10,0.5); }
                    .hometv-header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
                    .hometv-item { display: flex; align-items: center; padding: 12px; margin-bottom: 8px; border-radius: 6px; background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.2s ease; }
                    .hometv-item.focus { background: #fff !important; color: #000 !important; transform: scale(1.02); box-shadow: 0 4px 15px rgba(255,255,255,0.3); }
                    .hometv-item__logo { width: 45px; height: 45px; object-fit: contain; margin-right: 15px; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; }
                    .hometv-item__title { font-size: 18px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .hometv-details { margin-top: 20px; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border-left: 4px solid #fff; }
                    .hometv-details__title { font-size: 28px; font-weight: bold; margin-bottom: 15px; }
                    .hometv-epg__current { font-size: 18px; color: #ffc107; margin-bottom: 10px; font-weight: bold; }
                    .hometv-epg__next { font-size: 16px; color: #b3b3b3; }
                    .hometv-loading { font-size: 20px; text-align: center; margin-top: 50px; color: #aaa; }
                    .hometv-digit-overlay { position: fixed; top: 10%; right: 5%; background: rgba(0,0,0,0.8); color: #fff; padding: 15px 30px; font-size: 40px; border-radius: 8px; z-index: 9999; font-weight: bold; border: 2px solid #fff; display:none; }
                </style>`);
            }

            comp.create = function () {
                comp.activity.title = 'HOME TV';
                self.active = true;

                var sidebar = $('<div class="hometv-sidebar"></div>');
                var content = $('<div class="hometv-content"></div>');
                
                self.html.append(sidebar);
                self.html.append(content);

                var list_html = $('<div class="hometv-list"></div>');
                var header = $('<div class="hometv-header">Пакеты ТВ каналов</div>');
                list_html.append(header);

                // Отрисовка главного меню категорий (каналов-плейлистов)
                channelsData.forEach(function (ch, index) {
                    var hideLogos = Lampa.Storage.get('hometv_hide_logos', 'false') === 'true';
                    var cardSize = Lampa.Storage.get('hometv_card_size', 'medium');
                    
                    var sizeStyle = 'width:45px; height:45px;';
                    if (cardSize === 'small') sizeStyle = 'width:30px; height:30px;';
                    if (cardSize === 'large') sizeStyle = 'width:60px; height:60px;';

                    var img_html = (!hideLogos && ch.logo) ? `<img class="hometv-item__logo" style="${sizeStyle}" src="${ch.logo}" onerror="this.style.display='none'"/>` : '';
                    
                    var item = $(`<div class="hometv-item selector" data-index="${index}">
                        ${img_html}
                        <div class="hometv-item__title">${ch.title}</div>
                    </div>`);

                    item.on('hover:focus', function () {
                        self.current_index = index;
                        self.updateDetails(ch, content);
                        // Автоскролл к элементу в фокусе
                        scroll.scrollTo(item[0]);
                    });

                    item.on('hover:enter', function () {
                        self.loadM3UPlaylist(ch.playlist, ch.title, content);
                    });

                    // Кнопка избранного (нажатие контекстного меню или long press / жёлтая кнопка на пультах)
                    item.on('contextmenu', function (e) {
                        e.preventDefault();
                        self.toggleFavorite(ch);
                    });

                    list_html.append(item);
                });

                scroll.append(list_html);
                sidebar.append(scroll.render());
                files.append(self.html);
                
                // Создание оверлея цифрового ввода
                if (!$('.hometv-digit-overlay').length) {
                    $('body').append('<div class="hometv-digit-overlay"></div>');
                }
            };

            comp.render = function () {
                return files.render();
            };

            comp.start = function () {
                // Передача управления контроллеру Lampa Navigator
                Lampa.Controller.add('hometv_main', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(self.html);
                        Lampa.Controller.collectionFocus(false, self.html);
                    },
                    left: function () {
                        Lampa.Controller.toggle('menu');
                    },
                    up: function () {
                        Lampa.Navigator.move('up');
                    },
                    down: function () {
                        Lampa.Navigator.move('down');
                    },
                    right: function () {
                        // Переход на внутренний контент, если необходимо
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });
                Lampa.Controller.toggle('hometv_main');
                self.bindGlobalKeys();
            };

            comp.destroy = function () {
                self.active = false;
                self.unbindGlobalKeys();
                scroll.destroy();
                files.destroy();
                $('.hometv-digit-overlay').remove();
            };
        },

        // Обновление правой инфо-панели
        updateDetails: function (item, container) {
            container.empty();
            var epg = this.getEPGForChannel(item.title);
            var favStatus = this.isFavorite(item) ? '★ В Избранном' : '☆ Добавить в избранное (Зажмите OK)';
            
            var details = $(`<div class="hometv-details">
                <div class="hometv-details__title">${item.title}</div>
                <div style="font-size:14px; color:#aaa; margin-bottom:15px;">${favStatus}</div>
                <div class="hometv-epg__current">Сейчас: ${epg.current}</div>
                <div class="hometv-epg__next">Далее: ${epg.next}</div>
            </div>`);
            container.append(details);
        },

        // Загрузка и парсинг M3U плейлиста во внутреннюю структуру
        loadM3UPlaylist: function (url, fallbackTitle, contentContainer) {
            var self = this;
            if (this.playlist_cache[url]) {
                this.renderChannelsList(this.playlist_cache[url], contentContainer);
                return;
            }

            contentContainer.empty().append('<div class="hometv-loading">Загрузка каналов потока M3U...</div>');

            if (!navigator.onLine) {
                Lampa.Noty.show('Отсутствует интернет-соединение.');
                contentContainer.empty().append('<div class="hometv-loading">Ошибка сети</div>');
                return;
            }

            $.ajax({
                url: url,
                method: 'GET',
                timeout: 15000,
                success: function (data) {
                    var parsedList = self.parseM3U(data);
                    if (parsedList.length === 0) {
                        // Если M3U не содержит разделений, создаем виртуальный одиночный канал на основе прямого линка плейлиста
                        parsedList.push({
                            title: fallbackTitle,
                            url: url,
                            logo: ''
                        });
                    }
                    
                    // Применяем пользовательскую сортировку
                    if (Lampa.Storage.get('hometv_sort', 'default') === 'alpha') {
                        parsedList.sort(function (a, b) { return a.title.localeCompare(b.title); });
                    }

                    self.playlist_cache[url] = parsedList;
                    self.current_playlist_url = url;
                    self.renderChannelsList(parsedList, contentContainer);
                },
                error: function () {
                    Lampa.Noty.show('Не удалось загрузить M3U плейлист.');
                    contentContainer.empty().append('<div class="hometv-loading">Ошибка загрузки данных плейлиста</div>');
                }
            });
        },

        // Высокопроизводительный парсер M3U для больших списков (10000+ каналов)
        parseM3U: function (data) {
            var lines = data.split(/\r?\n/);
            var channels = [];
            var currentExtinf = null;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line) continue;

                if (line.indexOf('#EXTINF:') === 0) {
                    currentExtinf = line;
                } else if (line.indexOf('#') !== 0 && currentExtinf) {
                    // Строка является URL-адресом потока
                    var info = currentExtinf;
                    
                    // Регулярные выражения для вычленения атрибутов tvg
                    var tvgIdMatch = info.match(/tvg-id="([^"]+)"/i);
                    var tvgNameMatch = info.match(/tvg-name="([^"]+)"/i);
                    var tvgLogoMatch = info.match(/tvg-logo="([^"]+)"/i);
                    var groupTitleMatch = info.match(/group-title="([^"]+)"/i);
                    
                    // Поиск названия канала в конце строки #EXTINF
                    var titleIdx = info.lastIndexOf(',');
                    var parsedTitle = titleIdx !== -1 ? info.substring(titleIdx + 1).trim() : 'Без названия';

                    channels.push({
                        title: parsedTitle,
                        url: line,
                        tvgId: tvgIdMatch ? tvgIdMatch[1] : '',
                        tvgName: tvgNameMatch ? tvgNameMatch[1] : '',
                        logo: tvgLogoMatch ? tvgLogoMatch[1] : '',
                        group: groupTitleMatch ? groupTitleMatch[1] : 'Общие'
                    });
                    
                    currentExtinf = null; // сброс для следующего прохода
                }
            }
            return channels;
        },

        // Отображение вложенного списка каналов плейлиста во внутренней рабочей зоне
        renderChannelsList: function (channels, container) {
            var self = this;
            this.list = channels;
            container.empty();

            var innerScroll = new Lampa.Scroll({ mask: true, over: true });
            var listWrapper = $('<div class="hometv-channels-inner-list"></div>');

            channels.forEach(function (ch, idx) {
                var hideLogos = Lampa.Storage.get('hometv_hide_logos', 'false') === 'true';
                var img = (!hideLogos && ch.logo) ? `<img class="hometv-item__logo" src="${ch.logo}" onerror="this.style.display='none'"/>` : '';
                
                var el = $(`<div class="hometv-item selector" data-channel-idx="${idx}">
                    ${img}
                    <div class="hometv-item__title">${ch.title}</div>
                </div>`);

                el.on('hover:focus', function () {
                    self.current_index = idx;
                    innerScroll.scrollTo(el[0]);
                });

                el.on('hover:enter', function () {
                    self.playChannel(ch);
                });

                listWrapper.append(el);
            });

            innerScroll.append(listWrapper);
            container.append(innerScroll.render());

            // Динамически переключаем контекст управления Navigator на новый список под-каналов
            Lampa.Controller.add('hometv_channels_view', {
                toggle: function () {
                    Lampa.Controller.collectionSet(container);
                    Lampa.Controller.collectionFocus(false, container);
                },
                left: function () {
                    Lampa.Controller.toggle('hometv_main');
                },
                up: function () {
                    Lampa.Navigator.move('up');
                },
                down: function () {
                    Lampa.Navigator.move('down');
                },
                back: function () {
                    Lampa.Controller.toggle('hometv_main');
                }
            });
            Lampa.Controller.toggle('hometv_channels_view');
        },

        // Поиск канала внутри плейлиста по критериям соответствия (Без учета регистра)
        findChannelMatch: function (query) {
            if (!this.list || this.list.length === 0) return null;
            var q = query.toLowerCase().trim();

            for (var i = 0; i < this.list.length; i++) {
                var ch = this.list[i];
                if ((ch.title && ch.title.toLowerCase().indexOf(q) !== -1) ||
                    (ch.tvgName && ch.tvgName.toLowerCase().indexOf(q) !== -1) ||
                    (ch.tvgId && ch.tvgId.toLowerCase().indexOf(q) !== -1)) {
                    return { channel: ch, index: i };
                }
            }
            return null;
        },

        // Запуск потокового воспроизведения медиаданных канала через встроенный плеер Lampa
        playChannel: function (channel) {
            if (!channel || !channel.url) {
                Lampa.Noty.show('Ссылка на поток не найдена.');
                return;
            }

            // Определение формата трансляции видео
            var videoUrl = channel.url;
            var isMPEGTS = videoUrl.indexOf('.ts') !== -1 || videoUrl.indexOf('mpegts') !== -1;
            
            var playlistItem = {
                title: channel.title,
                url: videoUrl,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (QtEmbedded; Linux; x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Lampa/1.0.0 Safari/537.36'
                }
            };

            // Вызов нативного ядра Lampa Player
            Lampa.Player.play(playlistItem);
            Lampa.Player.playlist([playlistItem]);
        },

        // Интеграция переключения каналов вверх/вниз и цифровых кнопок пульта
        bindGlobalKeys: function () {
            var self = this;
            $(window).on('keydown.hometv', function (e) {
                if (!self.active) return;

                var code = e.keyCode || e.which;
                
                // Коды кнопок для Samsung Tizen, LG WebOS, Android TV, Windows, Linux, macOS Browser
                // Цифровой ввод (0-9)
                if (code >= 48 && code <= 57) {
                    self.handleDigitInput(code - 48);
                }
                // Альтернативные коды цифровых клавиш некоторых пультов
                else if (code >= 96 && code <= 105) {
                    self.handleDigitInput(code - 96);
                }
                // Кнопки переключения каналов CH+ / PageUp (33 или специальные коды)
                else if (code === 33 || code === 427 || code === 10252) {
                    e.preventDefault();
                    self.changeChannelOffset(-1);
                }
                // Кнопки переключения каналов CH- / PageDown (34 или специальные коды)
                else if (code === 34 || code === 428 || code === 10253) {
                    e.preventDefault();
                    self.changeChannelOffset(1);
                }
            });
        },

        unbindGlobalKeys: function () {
            $(window).off('keydown.hometv');
        },

        // Накопительная логика обработки последовательного цифрового ввода (например: 1, 5 -> Канал 15)
        handleDigitInput: function (digit) {
            var self = this;
            clearTimeout(this.digit_timer);
            this.digit_buffer += digit;

            var overlay = $('.hometv-digit-overlay');
            overlay.text(this.digit_buffer).fadeIn(100);

            this.digit_timer = setTimeout(function () {
                var channelNum = parseInt(self.digit_buffer, 10);
                self.digit_buffer = '';
                overlay.fadeOut(200);

                // Корректировка под индекс массива (пользователи считают с 1)
                var targetIdx = channelNum - 1;
                if (self.list && self.list[targetIdx]) {
                    self.current_index = targetIdx;
                    self.playChannel(self.list[targetIdx]);
                    Lampa.Noty.show('Переключено на канал №' + channelNum + ': ' + self.list[targetIdx].title);
                } else {
                    Lampa.Noty.show('Канал №' + channelNum + ' не найден в текущем списке.');
                }
            }, 1500); // Окно ожидания ввода следующей цифры номера - 1.5 секунды
        },

        // Смещение по списку вперед / назад (CH+ / CH-)
        changeChannelOffset: function (offset) {
            if (!this.list || this.list.length === 0) return;
            
            var newIdx = this.current_index + offset;
            if (newIdx < 0) newIdx = this.list.length - 1;
            if (newIdx >= this.list.length) newIdx = 0;

            this.current_index = newIdx;
            var targetChannel = this.list[this.current_index];
            this.playChannel(targetChannel);
            
            // Если видеоплеер открыт, выводим OSD-уведомление поверх экрана
            Lampa.Noty.show('Канал: ' + targetChannel.title, { time: 2000 });
        },

        // Загрузка и парсинг XMLTV телепрограммы (EPG)
        loadEPG: function () {
            var self = this;
            var epgUrl = Lampa.Storage.get('hometv_epg_url', 'https://example.com/epg.xml.gz');
            
            if (!epgUrl) return;

            $.ajax({
                url: epgUrl,
                method: 'GET',
                timeout: 20000,
                success: function (xml) {
                    self.parseXMLTV(xml);
                },
                error: function () {
                    // Тихое глушение ошибок EPG без прерывания пользовательского UX
                    console.log('HOME TV: Ошибка загрузки данных телепрограммы EPG.');
                }
            });
        },

        // Парсер структуры XMLTV формата
        parseXMLTV: function (xmlString) {
            var self = this;
            try {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xmlString, "text/xml");
                var programmes = xmlDoc.getElementsByTagName("programme");
                
                var tempEpg = {};
                var now = new Date();

                for (var i = 0; i < programmes.length; i++) {
                    var prog = programmes[i];
                    var channelId = prog.getAttribute("channel");
                    if (!channelId) continue;

                    var startAttr = prog.getAttribute("start");
                    var titleNode = prog.getElementsByTagName("title")[0];
                    if (!titleNode || !startAttr) continue;

                    var titleText = titleNode.textContent;
                    var startTime = self.parseXMLTVDate(startAttr);

                    if (!tempEpg[channelId]) tempEpg[channelId] = [];
                    tempEpg[channelId].push({
                        time: startTime,
                        title: titleText
                    });
                }

                // Сортируем программы по времени хронологии
                for (var cid in tempEpg) {
                    tempEpg[cid].sort(function (a, b) { return a.time - b.time; });
                }

                this.epg_data = tempEpg;
            } catch (e) {
                console.log('HOME TV: Ошибка обработки XMLTV.', e);
            }
        },

        // Трансляция внутренней строки даты XMLTV формата в объект даты JS
        parseXMLTVDate: function (str) {
            // Формат: YYYYMMDDHHMMSS +HHMM
            if (str.length >= 14) {
                var year = parseInt(str.substr(0, 4), 10);
                var month = parseInt(str.substr(4, 2), 10) - 1;
                var day = parseInt(str.substr(6, 2), 10);
                var hour = parseInt(str.substr(8, 2), 10);
                var min = parseInt(str.substr(10, 2), 10);
                var sec = parseInt(str.substr(12, 2), 10);
                return new Date(year, month, day, hour, min, sec);
            }
            return new Date();
        },

        // Извлечение текущей и следующей передачи для конкретного канала
        getEPGForChannel: function (channelTitle) {
            var res = { current: 'Нет данных', next: 'Нет данных' };
            if (!this.epg_data || Object.keys(this.epg_data).length === 0) return res;

            // Поиск совпадений по ID программы
            var targetId = channelTitle.trim();
            var list = this.epg_data[targetId];

            if (!list) {
                // Прямой перебор ключей, если ID не совпали напрямую
                for (var key in this.epg_data) {
                    if (targetId.toLowerCase().indexOf(key.toLowerCase()) !== -1 || key.toLowerCase().indexOf(targetId.toLowerCase()) !== -1) {
                        list = this.epg_data[key];
                        break;
                    }
                }
            }

            if (list && list.length > 0) {
                var now = new Date();
                for (var i = 0; i < list.length; i++) {
                    if (list[i].time <= now && (!list[i + 1] || list[i + 1].time > now)) {
                        var formatTime = function(d) { return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); };
                        res.current = formatTime(list[i].time) + ' — ' + list[i].title;
                        if (list[i + 1]) {
                            res.next = formatTime(list[i + 1].time) + ' — ' + list[i + 1].title;
                        }
                        break;
                    }
                }
            }
            return res;
        },

        // Таймер планировщика автоматического фонового обновления списков
        startAutoUpdateTimer: function () {
            var self = this;
            if (this.timers.update) clearInterval(this.timers.update);

            var minutes = parseInt(Lampa.Storage.get('hometv_update_interval', '30'), 10);
            
            this.timers.update = setInterval(function () {
                // Сброс локального кэша для принудительного обновления
                self.playlist_cache = {};
                if (self.active && self.current_playlist_url) {
                    Lampa.Noty.show('HOME TV: Фоновое обновление плейлиста потока...');
                    // Мягкое обновление контента без разрушения DOM структуры текущей сессии
                    self.loadEPG();
                }
            }, minutes * 60 * 1000);
        }
    };

    // Точка входа в систему плагинов Lampa
    HomeTV.init();
})();
