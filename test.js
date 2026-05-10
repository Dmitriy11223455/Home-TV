(function () {
    'use strict';

    // 1. Стили интерфейса (из вашего кода)
    $('<style>' +
        '.home-tv { display: flex; width: 100%; height: 100%; padding: 1.5% 2%; box-sizing: border-box; background: #000; }' +
        '.home-tv__menu { width: 20%; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 20px; }' +
        '.home-tv__list { width: 45%; padding: 0 30px; }' +
        '.home-tv__info { width: 35%; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.07); border-radius: 10px; margin-bottom: 10px; border: 2px solid transparent; cursor: pointer; }' +
        '.home-tv-item.focus { border-color: #f39c12; background: rgba(255,255,255,0.15); transform: scale(1.03); }' +
        '.home-tv-item__num { font-size: 1.2em; color: #f39c12; margin-right: 15px; font-weight: bold; }' +
        '.home-tv-info__title { font-size: 2.5em; margin-bottom: 15px; color: #fff; font-weight: bold; }' +
        
        /* Стили страницы канала */
        '.htv-page { display: flex; padding: 50px; background: #000; height: 100%; width: 100%; }' +
        '.htv-page__logo { width: 300px; height: 300px; object-fit: contain; background: rgba(255,255,255,0.05); border-radius: 20px; margin-right: 50px; box-shadow: 0 10px 50px rgba(243,156,18,0.2); }' +
        '.htv-page__content { flex: 1; }' +
        '.htv-page__title { font-size: 4em; font-weight: bold; color: #fff; margin-bottom: 20px; }' +
        '.htv-page__desc { font-size: 1.5em; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 40px; }' +
        '.htv-page__button { display: inline-block; padding: 20px 60px; background: #f39c12; color: #000; border-radius: 15px; font-weight: bold; font-size: 1.8em; cursor: pointer; }' +
        '.htv-page__button.focus { background: #fff; transform: scale(1.1); }' +
    '</style>').appendTo('body');

    // 2. Компонент СТРАНИЦЫ КАНАЛА
    Lampa.Component.add('home_tv_view', function (object, exam) {
        var html = $('<div class="htv-page">' +
            '<img class="htv-page__logo" src="https://berezka.live">' +
            '<div class="htv-page__content">' +
                '<div class="htv-page__title">' + object.title + '</div>' +
                '<div class="htv-page__desc">' + (object.desc || '') + '</div>' +
                '<div class="htv-page__button selector">СМОТРЕТЬ</div>' +
            '</div>' +
        '</div>');

        this.create = function () {
            html.find('.htv-page__button').on('hover:enter', function () {
                Lampa.Noty.show('Запуск потока...');
                Lampa.Player.play({ url: object.url, title: object.title });
            });
        };

        this.render = function () { return html; };

        this.active = function () {
            Lampa.Controller.add('htv_view', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(html.find('.htv-page__button')[0], html);
                },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('htv_view');
        };

        this.create();
    });

    // 3. Главный компонент (Список каналов)
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var items = [];
        var html = $('<div class="home-tv"></div>');
        var menu = $('<div class="home-tv__menu"></div>');
        var list = $('<div class="home-tv__list"></div>');
        var info = $('<div class="home-tv__info"></div>');

        this.create = function () {
            ['Все каналы', 'Основные', 'Кино'].forEach(function (cat) {
                menu.append('<div class="home-tv-menu__item">' + cat + '</div>');
            });

            var my_channels = [
                { title: 'Первый канал', url: 'https://berezka.live', desc: 'Главный эфир страны.' },
                { title: 'ТНТ', url: 'https://site-b.net', desc: 'Развлекательное ТВ.' }
            ];

            my_channels.forEach(function (channel, index) {
                var card = $('<div class="home-tv-item selector">' +
                    '<div class="home-tv-item__num">' + (index + 1).toString().padStart(3, '0') + '</div>' +
                    '<div class="home-tv-item__name">' + channel.title + '</div>' +
                    '</div>');

                card.on('hover:focus', function () {
                    info.html('<div class="home-tv-info__title">' + channel.title + '</div>' +
                        '<div class="home-tv-info__desc" style="font-size:1.3em; opacity:0.6">' + channel.desc + '</div>');
                    scroll.scrollTo(card);
                });

                card.on('hover:enter', function () {
                    Lampa.Activity.push({
                        title: channel.title,
                        component: 'home_tv_view',
                        url: channel.url,
                        desc: channel.desc
                    });
                });

                list.append(card);
                items.push(card);
            });

            html.append(menu).append(list).append(info);
            scroll.append(list);
        };

        this.render = function () { return html; };

        this.active = function () {
            Lampa.Controller.add('home_tv_main', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    if (items.length) Lampa.Controller.collectionFocus(items[0][0], html);
                },
                up: function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_main');
        };

        this.create();
    });

    // 4. Инъекция в меню Lampa (Ваша структура)
    function injectMenu() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        
        var menu_list = $('.menu__list, .menu__items, .menu .list');
        if (menu_list.length > 0) {
            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
                '</li>');

            item.on('hover:enter click', function () {
                $('body').removeClass('menu--open');
                Lampa.Activity.push({ 
                    title: 'HOME TV', 
                    component: 'home_tv_plugin' 
                });
            });

            // Ищем настройки, чтобы вставить ПЕРЕД ними
            var set = menu_list.find('[data-action="settings"]');
            if (set.length > 0) {
                set.before(item);
            } else {
                menu_list.append(item);
            }
        }
    }

    // Запуск (теперь всё закрыто верно)
    if (window.appready) injectMenu();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') injectMenu();
        });
    }

})();


