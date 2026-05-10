(function () {
    'use strict';

    // 1. ДОБАВЛЯЕМ СТИЛИ ДЛЯ ОТОБРАЖЕНИЯ (ЧТОБЫ НЕ СЛИПАЛОСЬ)
    var style = $('<style>' +
        '.home-tv { display: flex; width: 100%; height: 100%; padding: 20px; font-family: sans-serif; }' +
        '.home-tv__menu { width: 250px; border-right: 1px solid rgba(255,255,255,0.1); }' +
        '.home-tv__list { flex: 1; padding: 0 40px; display: flex; flex-direction: column; gap: 10px; }' +
        '.home-tv__info { width: 400px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 20px; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; transition: 0.2s; }' +
        '.home-tv-item.focus { background: #fff; color: #000; transform: scale(1.02); }' +
        '.home-tv-item__num { font-size: 1.5em; font-weight: bold; margin-right: 20px; opacity: 0.5; }' +
        '.home-tv-item__name { font-size: 1.2em; }' +
        '.home-tv-menu__item { padding: 15px; opacity: 0.6; font-size: 1.2em; }' +
        '.home-tv-menu__item.focus { opacity: 1; color: #ffeb3b; }' +
        '.home-tv-info__title { font-size: 2em; margin-bottom: 20px; font-weight: bold; }' +
    '</style>');
    $('body').append(style);

    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [];
        var html = $('<div class="home-tv"></div>');
        var menu = $('<div class="home-tv__menu"></div>');
        var list = $('<div class="home-tv__list"></div>');
        var info = $('<div class="home-tv__info"></div>');

        this.create = function () {
            // Категории
            ['Все каналы', 'Основные', 'Кино'].forEach(function(cat) {
                menu.append('<div class="home-tv-menu__item selector">' + cat + '</div>');
            });

            var my_channels = [
                { title: 'Первый канал', url: 'https://berezka.live', desc: 'Главный канал страны. Прямой эфир.' },
                { title: 'ТНТ', url: 'https://site-b.net', desc: 'Развлекательный канал: сериалы и шоу.' }
            ];

            my_channels.forEach(function (channel, index) {
                var card = $('<div class="home-tv-item selector">' +
                                '<div class="home-tv-item__num">' + (index + 1).toString().padStart(3, '0') + '</div>' +
                                '<div class="home-tv-item__name">' + channel.title + '</div>' +
                             '</div>');
                
                card.on('hover:focus', function () {
                    info.html('<div class="home-tv-info__title">' + channel.title + '</div>' +
                              '<div class="home-tv-info__desc">' + channel.desc + '</div>');
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Загрузка потока...');
                    var network = new Lampa.Reguest();
                    network.native('http://cub.watch' + channel.url, function (res) {
                        var match = /(https?:\/\/[^"']+\.m3u8[^"']*)/i.exec(res);
                        if (match) Lampa.Player.play({ url: match[0], title: channel.title });
                    }, function(){ Lampa.Noty.show('Ошибка сети'); }, false, {dataType: 'text'});
                });

                list.append(card);
                items.push(card);
            });

            html.append(menu).append(list).append(info);
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

    // Инъекция в меню Lampa
    function injectMenu() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        var m_list = $('.menu__list, .menu__items, .menu .list');
        if (m_list.length > 0) {
            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
                '</li>');
            item.on('hover:enter click', function () {
                $('body').removeClass('menu--open');
                Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
            });
            var set = m_list.find('[data-action="settings"]');
            if (set.length > 0) set.before(item); else m_list.append(item);
        }
    }
    setInterval(injectMenu, 2000);
})();
