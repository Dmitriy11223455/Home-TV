(function () {
    'use strict';

    // 1. Стили (Ваша структура + фикс для левого меню внутри плагина)
    var styles = '<style>' +
        '.home-tv { display: flex; width: 100%; height: 100%; padding: 1.5% 2%; box-sizing: border-box; background: #000; position: absolute; top:0; left:0; z-index:100; }' +
        '.home-tv__menu { width: 25%; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 20px; display: flex; flex-direction: column; }' +
        '.home-tv__list { width: 40%; padding: 0 30px; }' +
        '.home-tv__info { width: 35%; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 15px; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.07); border-radius: 10px; margin-bottom: 10px; border: 2px solid transparent; cursor: pointer; }' +
        '.home-tv-item.focus { border-color: #f39c12; background: rgba(255,255,255,0.15); transform: scale(1.02); }' +
        '.home-tv-menu__item { padding: 15px; opacity: 0.5; font-size: 1.4em; margin-bottom: 8px; border-radius: 10px; cursor: pointer; }' +
        '.home-tv-menu__item.focus { opacity: 1; background: #f39c12; color: #000; font-weight: bold; }' +
        '</style>';
    
    $('body').append(styles);

    // 2. Компонент плагина
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var html = $('<div class="home-tv"></div>');
        var menu = $('<div class="home-tv__menu"></div>');
        var list = $('<div class="home-tv__list"></div>');
        var info = $('<div class="home-tv__info"></div>');
        var scroll = new Lampa.Scroll({mask: true, over: true});
        
        var data_sources = [
            {
                category: 'Основные',
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
            // Создаем левое меню категорий внутри плагина
            data_sources.forEach(function(source) {
                var m_item = $('<div class="home-tv-menu__item selector">' + source.category + '</div>');
                m_item.on('hover:enter', function() {
                    _this.renderChannels(source.channels);
                });
                menu.append(m_item);
            });

            html.append(menu).append(list).append(info);
            this.renderChannels(data_sources[0].channels);
            return this.render();
        };

        this.renderChannels = function(channels) {
            list.empty();
            var inner_list = $('<div style="width:100%"></div>');
            channels.forEach(function (channel) {
                var card = $('<div class="home-tv-item selector"><div class="home-tv-item__name">' + channel.title + '</div></div>');
                card.on('hover:focus', function () {
                    info.html('<div style="font-size:2.5em; color:#fff; margin-bottom:15px;">' + channel.title + '</div><div style="font-size:1.3em; opacity:0.6; line-height:1.5;">' + channel.desc + '</div>');
                });
                card.on('hover:enter', function () {
                    Lampa.Player.play({ url: channel.url, title: channel.title });
                });
                inner_list.append(card);
            });
            list.append(scroll.render());
            scroll.clear();
            scroll.append(inner_list);
            Lampa.Controller.toggle('home_tv_ctrl');
        };

        this.render = function () { return html; };

        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
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

    // 3. Метод добавления в главное меню (Исправленный под новый UI)
    function addPlugin() {
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;

        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
            '<div class="menu__text">HOME TV</div>' +
            '</li>');

        menu_item.on('hover:enter click', function () {
            Lampa.Activity.push({
                title: 'HOME TV',
                component: 'home_tv_plugin',
                page: 1
            });
        });

        // Пытаемся вставить в список
        var list = $('.menu .menu__list');
        if (list.length) {
            var settings = list.find('[data-action="settings"]').closest('li');
            if (settings.length) settings.before(menu_item);
            else list.append(menu_item);
        }
        
        // Дополнительно вешаем на Lampa.Listener для гарантии
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready' && $('.menu__item[data-action="home_tv"]').length == 0) {
                addPlugin();
            }
        });
    }

    // Запуск
    if (window.appready) addPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addPlugin();
        });
    }

    // Резервный таймер (для новых версий Lampa)
    var interval = setInterval(function() {
        addPlugin();
        if ($('.menu__item[data-action="home_tv"]').length > 0) clearInterval(interval);
    }, 2000);

})();
