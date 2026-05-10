(function () {
    'use strict';

    // 1. Стили интерфейса (Ваши стили)
    $('<style>' +
        '.home-tv { display: flex; width: 100%; height: 100%; padding: 1.5% 2%; box-sizing: border-box; background: #000; }' +
        '.home-tv__menu { width: 20%; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 20px; }' +
        '.home-tv__list { width: 45%; padding: 0 30px; }' +
        '.home-tv__info { width: 35%; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 15px; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.07); border-radius: 10px; margin-bottom: 10px; border: 2px solid transparent; }' +
        '.home-tv-item.focus { border-color: #f39c12; background: rgba(255,255,255,0.15); transform: scale(1.03); }' +
        '.home-tv-item__num { font-size: 1.2em; color: #f39c12; margin-right: 15px; font-weight: bold; }' +
        '.home-tv-info__title { font-size: 2.5em; margin-bottom: 15px; color: #fff; }' +
        '.home-tv-menu__item { padding: 12px; opacity: 0.5; font-size: 1.3em; margin-bottom: 5px; border-radius: 8px; cursor: pointer; }' +
        '.home-tv-menu__item.focus { opacity: 1; color: #fff; background: rgba(243,156,18,0.5); }' +
    '</style>').appendTo('body');

    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = []; // Список элементов для контроллера
        var html = $('<div class="home-tv"></div>');
        var menu = $('<div class="home-tv__menu"></div>');
        var list = $('<div class="home-tv__list"></div>');
        var info = $('<div class="home-tv__info"></div>');

        // Данные: Категории и их каналы
        var data_sources = [
            {
                category: 'Все каналы',
                channels: [
                    { title: 'Первый канал', url: 'https://berezka.live', desc: 'Главный эфир страны. Актуальные новости и шоу.' },
                    { title: 'ТНТ', url: 'https://site-b.net', desc: 'Развлекательный контент, сериалы и юмор.' }
                ]
            },
            {
                category: 'Кино',
                channels: [
                    { title: 'Кино ТВ', url: 'https://berezka.live/cinema', desc: 'Лучшие фильмы мирового кинематографа.' }
                ]
            }
        ];

        this.create = function () {
            // 2. ОТОБРАЖЕНИЕ В ЛЕВОЕ МЕНЮ (Категории)
            data_sources.forEach(function(source) {
                var menu_item = $('<div class="home-tv-menu__item selector">' + source.category + '</div>');
                
                menu_item.on('hover:enter', function() {
                    _this.renderChannels(source.channels); // Перерисовываем каналы при выборе
                });

                menu.append(menu_item);
            });

            html.append(menu).append(list).append(info);
            
            // Загружаем первую категорию по умолчанию
            this.renderChannels(data_sources[0].channels);

            return this.render();
        };

        // Метод отрисовки списка каналов
        this.renderChannels = function(channels) {
            list.empty(); // Очищаем список
            items = []; // Сбрасываем фокусную коллекцию
            
            channels.forEach(function (channel, index) {
                var card = $('<div class="home-tv-item selector">' +
                                '<div class="home-tv-item__num">' + (index + 1).toString().padStart(3, '0') + '</div>' +
                                '<div class="home-tv-item__name">' + channel.title + '</div>' +
                             '</div>');

                card.on('hover:focus', function () {
                    info.html('<div class="home-tv-info__title">' + channel.title + '</div>' +
                              '<div class="home-tv-info__desc" style="font-size:1.2em; opacity:0.8">' + channel.desc + '</div>');
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Запуск ' + channel.title);
                    var network = new Lampa.Reguest();
                    network.native('http://cub.watch/proxy?q=' + encodeURIComponent(channel.url), function (res) {
                        var match = /(https?:\/\/[^"']+\.m3u8[^"']*)/i.exec(res);
                        if (match) Lampa.Player.play({ url: match[0], title: channel.title });
                        else Lampa.Noty.show('Поток не найден');
                    }, function(){ Lampa.Noty.show('Ошибка прокси'); }, false, {dataType: 'text'});
                });

                list.append(card);
                items.push(card[0]); // Добавляем нативный элемент для контроллера
            });

            // Обновляем скролл
            list.append(scroll.render());
            scroll.append(list);
        };

        this.render = function () { return html; };

        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    // Фокус либо на меню, либо на первый канал
                    Lampa.Controller.collectionFocus(html.find('.selector')[0], html);
                },
                up: function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                right: function () { Lampa.Controller.move('right'); },
                left: function () { Lampa.Controller.move('left'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };

        this.create();
    });

    // Инъекция в главное меню Lampa
    function injectMenu() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        var menu_list = $('.menu__list, .menu__items, .menu .list');
        if (menu_list.length > 0) {
            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
                '</li>');

            item.on('hover:enter click', function () {
                $('body').removeClass('menu--open');
                Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
            });

            var set = menu_list.find('[data-action="settings"]');
            if (set.length > 0) set.before(item); else menu_list.append(item);
        }
    }
    setInterval(injectMenu, 2000);
})();
