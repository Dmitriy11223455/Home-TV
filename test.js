(function () {
    'use strict';

    // 1. Стили
    $('<style>' +
        '.home-tv { display: flex; flex-direction: column; width: 100%; height: 100%; padding: 20px; box-sizing: border-box; background: #000; }' +
        '.home-tv__head { margin-bottom: 20px; }' +
        '.home-tv__source { color: #f39c12; font-size: 1.2em; margin-bottom: 10px; text-transform: uppercase; opacity: 0.6; }' +
        '.home-tv__categories { display: flex; gap: 15px; margin-bottom: 30px; }' +
        '.home-tv-cat { padding: 10px 20px; background: rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; border: 2px solid transparent; }' +
        '.home-tv-cat.focus { border-color: #f39c12; background: rgba(255,255,255,0.15); }' +
        '.home-tv__body { display: flex; flex: 1; overflow: hidden; }' +
        '.home-tv__list { width: 60%; height: 100%; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 15px; background: rgba(255,255,255,0.03); margin-bottom: 8px; border-radius: 10px; border: 2px solid transparent; }' +
        '.home-tv-item.focus { border-color: #f39c12; background: rgba(255,255,255,0.1); }' +
        '.home-tv-item__num { color: #f39c12; font-weight: bold; margin-right: 15px; min-width: 30px; }' +
    '</style>').appendTo('body');

    // 2. Компонент просмотра (Упрощенный для стабильности)
    Lampa.Component.add('home_tv_view', function (object, exam) {
        var html = $('<div class="htv-page" style="padding:50px; text-align:center;">' +
            '<h1 style="font-size:3em; margin-bottom:20px;">' + object.title + '</h1>' +
            '<div class="htv-page__button selector" style="padding:20px 40px; background:#f39c12; display:inline-block; border-radius:10px; color:#000; font-weight:bold;">СМОТРЕТЬ ЭФИР</div>' +
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

    // 3. Главный компонент
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var items = [];
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div class="home-tv">' +
            '<div class="home-tv__head">' +
                '<div class="home-tv__source">Источник: Березка ТВ</div>' +
                '<div class="home-tv__categories"></div>' +
            '</div>' +
            '<div class="home-tv__body">' +
                '<div class="home-tv__list"></div>' +
            '</div>' +
        '</div>');

        this.create = function () {
            var cats = ['Березка ТВ', 'Архив', 'Premium', 'Детские', 'Спорт'];
            var channels = [
                { title: 'Первый канал', url: 'https://berezka.live' },
                { title: 'ТНТ', url: 'https://berezka.live' }
            ];

            // Рендер категорий
            cats.forEach(function(c) {
                var cat = $('<div class="home-tv-cat selector">' + c + '</div>');
                html.find('.home-tv__categories').append(cat);
                items.push(cat);
            });

            // Рендер списка
            channels.forEach(function(ch, i) {
                var card = $('<div class="home-tv-item selector">' +
                    '<div class="home-tv-item__num">' + (i+1) + '</div>' +
                    '<div class="home-tv-item__name">' + ch.title + '</div>' +
                '</div>');
                
                card.on('hover:enter', function() {
                    Lampa.Activity.push({ component: 'home_tv_view', title: ch.title, url: ch.url });
                });

                html.find('.home-tv__list').append(card);
                items.push(card);
            });
        };

        this.render = function () { return html; };

        this.active = function () {
            Lampa.Controller.add('home_tv_main', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(items[0] ? items[0][0] : null, html);
                },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_main');
        };

        this.create();
    });

    // 4. Инициализация меню
    function init() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        var menu = $('.menu__list');
        if (menu.length) {
            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M17 2l-5 5-5-5"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
            '</li>');
            
            item.on('hover:enter click', function() {
                $('body').removeClass('menu--open');
                Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
            });
            menu.append(item);
        }
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function(e){ if(e.type=='ready') init(); });
})();

