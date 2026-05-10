(function () {
    'use strict';

    // 1. Стили интерфейса
    $('<style>' +
        '.home-tv { display: flex; flex-direction: column; width: 100%; height: 100%; padding: 20px; box-sizing: border-box; background: #000; }' +
        '.home-tv__head { margin-bottom: 20px; }' +
        '.home-tv__source { color: #f39c12; font-size: 1.2em; margin-bottom: 10px; text-transform: uppercase; font-weight: bold; }' +
        '.home-tv__categories { display: flex; gap: 10px; margin-bottom: 20px; }' +
        '.home-tv-cat { padding: 8px 15px; background: rgba(255,255,255,0.1); border-radius: 5px; color: #fff; cursor: pointer; border: 2px solid transparent; }' +
        '.home-tv-cat.focus { border-color: #f39c12; background: #f39c12; color: #000; }' +
        '.home-tv__body { display: flex; flex: 1; gap: 30px; overflow: hidden; }' +
        '.home-tv__list { width: 50%; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); margin-bottom: 8px; border-radius: 8px; border: 2px solid transparent; cursor: pointer; }' +
        '.home-tv-item.focus { border-color: #f39c12; background: rgba(255,255,255,0.15); }' +
        '.home-tv-item__num { color: #f39c12; font-weight: bold; margin-right: 15px; }' +
        '.home-tv__info { width: 45%; background: rgba(255,255,255,0.03); border-radius: 15px; padding: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }' +
        '.home-tv-info__title { font-size: 2.5em; color: #fff; margin-bottom: 15px; }' +
        '.home-tv-info__desc { color: rgba(255,255,255,0.6); line-height: 1.5; font-size: 1.2em; }' +
    '</style>').appendTo('body');

    // 2. Компонент просмотра (Страница канала)
    Lampa.Component.add('home_tv_view', function (object, exam) {
        var html = $('<div class="htv-page" style="display:flex; align-items:center; justify-content:center; height:100%; width:100%; flex-direction:column; background:#000;">' +
            '<h1 style="font-size:4em; color:#fff; margin-bottom:30px;">' + object.title + '</h1>' +
            '<div class="htv-page__button selector" style="padding:20px 60px; background:#f39c12; color:#000; border-radius:15px; font-weight:bold; font-size:2em; cursor:pointer;">СМОТРЕТЬ</div>' +
        '</div>');

        this.create = function () {};
        this.render = function () { return html; };
        this.active = function () {
            Lampa.Controller.add('htv_view', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(html.find('.selector')[0], html);
                },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('htv_view');

            html.find('.selector').on('hover:enter', function() {
                Lampa.Player.play({ url: object.url, title: object.title });
            });
        };
    });

    // 3. Главный компонент (Список)
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this,
            scroll = new Lampa.Scroll({ mask: true, over: true }),
            items = [],
            html = $('<div class="home-tv">' +
                '<div class="home-tv__head"><div class="home-tv__source">Источник: Березка ТВ</div><div class="home-tv__categories"></div></div>' +
                '<div class="home-tv__body"><div class="home-tv__list"></div><div class="home-tv__info">Выбирите канал</div></div>' +
            '</div>');

        this.create = function () {
            // Категории
            ['Все каналы', 'Основные', 'Кино', 'Детские', 'Спорт'].forEach(function(catName) {
                var cat = $('<div class="home-tv-cat selector">' + catName + '</div>');
                html.find('.home-tv__categories').append(cat);
                items.push(cat);
            });

            // Каналы
            var data = [
                { title: 'Первый канал', url: 'https://berezka.live', desc: 'Главный телеканал страны.' },
                { title: 'ТНТ', url: 'https://site-b.net', desc: 'Развлекательный контент и сериалы.' }
            ];

            data.forEach(function(ch, i) {
                var card = $('<div class="home-tv-item selector">' +
                    '<div class="home-tv-item__num">' + (i + 1) + '</div>' +
                    '<div class="home-tv-item__name">' + ch.title + '</div>' +
                '</div>');

                card.on('hover:focus', function() {
                    html.find('.home-tv__info').html('<div class="home-tv-info__title">' + ch.title + '</div><div class="home-tv-info__desc">' + ch.desc + '</div>');
                });

                card.on('hover:enter', function() {
                    Lampa.Activity.push({ component: 'home_tv_view', title: ch.title, url: ch.url });
                });

                html.find('.home-tv__list').append(card);
                items.push(card);
            });
            scroll.append(html.find('.home-tv__list'));
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
                left: function () { Lampa.Controller.move('left'); },
                right: function () { Lampa.Controller.move('right'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_main');
        };

        this.create();
    });

    // 4. Инъекция в меню
    function inject() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        var menu = $('.menu__list');
        if (menu.length) {
            var el = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M17 2l-5 5-5-5"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
            '</li>');
            el.on('hover:enter click', function () {
                $('body').removeClass('menu--open');
                Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
            });
            var set = menu.find('[data-action="settings"]');
            if (set.length) set.before(el); else menu.append(el);
        }
    }

    if (window.appready) inject();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') inject(); });
})();

