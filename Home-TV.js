(function () {
    'use strict';

    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [];
        var html = $('<div class="iptv"></div>'); // Главный контейнер IPTV
        var info = $('<div class="iptv__info"></div>'); // Правая колонка с описанием
        var list = $('<div class="iptv__list"></div>'); // Центральная колонка с каналами
        var menu = $('<div class="iptv__menu"></div>'); // Левая колонка с категориями

        this.create = function () {
            // 1. Создаем боковое меню (категории)
            var categories = ['Все каналы', 'Основные', 'Детские', 'Фильмовые'];
            categories.forEach(function(cat, i){
                var item = $('<div class="iptv-menu__item selector' + (i==0 ? ' active' : '') + '">' + cat + '</div>');
                menu.append(item);
            });

            // 2. Твои каналы
            var my_channels = [
                { title: 'Первый канал', url: 'https://berezka.live', logo: 'https://tv-logo.com' },
                { title: 'ТНТ', url: 'https://site-b.net', logo: 'https://tv-logo.com' }
            ];

            my_channels.forEach(function (channel, index) {
                // Создаем карточку канала как на скриншоте
                var card = $('<div class="iptv-item selector">' +
                                '<div class="iptv-item__num">' + (index + 1).toString().padStart(3, '0') + '</div>' +
                                '<div class="iptv-item__logo"><img src="' + (channel.logo || '') + '" unselectable="on"></div>' +
                             '</div>');
                
                card.on('hover:focus', function () {
                    // Обновляем инфо справа при наведении
                    info.html('<div class="iptv-info__title">' + channel.title + '</div>' +
                              '<div class="iptv-info__description">Прямой эфир. Нажмите ОК для запуска.</div>');
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Запуск ' + channel.title);
                    // Твоя логика парсинга (упрощено для примера)
                    var network = new Lampa.Reguest();
                    network.native('http://cub.watch' + channel.url, function (res) {
                        var match = /(https?:\/\/[^"']+\.m3u8[^"']*)/i.exec(res);
                        if (match) Lampa.Player.play({ url: match[0], title: channel.title });
                    }, function(){ Lampa.Noty.show('Ошибка сети'); }, false, {dataType: 'text'});
                });

                list.append(card);
                items.push(card);
            });

            html.append(menu);
            html.append(list);
            html.append(info);
            scroll.append(html);
        };

        this.render = function () { return scroll.render(); };

        this.active = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(items[0], html);
                },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.create();
    });

    function injectMenu() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        var menu = $('.menu__list, .menu__items, .menu .list');
        if (menu.length > 0) {
            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
                '</li>');
            item.on('hover:enter click', function () {
                $('body').removeClass('menu--open');
                Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
            });
            var settings = menu.find('[data-action="settings"]');
            if (settings.length > 0) settings.before(item);
            else menu.append(item);
        }
    }
    setInterval(injectMenu, 2000);
})();

