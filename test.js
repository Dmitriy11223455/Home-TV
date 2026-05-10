(function () {
    'use strict';

    // 1. Стили (только самое необходимое)
    if (!$('#home-tv-styles').length) {
        $('<style id="home-tv-styles">' +
            '.home-tv-list { padding: 20px; }' +
            '.home-tv-card { margin-bottom: 10px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; }' +
            '.home-tv-card.focus { background: #f39c12; color: #000; }' +
            '.home-tv-card__title { font-size: 1.4em; font-weight: bold; }' +
            '.home-tv-card__desc { font-size: 0.9em; opacity: 0.7; margin-top: 5px; }' +
        '</style>').appendTo('body');
    }

    // 2. Компонент плагина
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv-list"></div>');
        
        // Список каналов (без дублей)
        var channels = [
            { title: 'Первый канал', url: 'https://berezka.live', desc: 'Главный эфир страны. Актуальные новости и шоу.' },
            { title: 'ТНТ', url: 'https://site-b.net', desc: 'Развлекательный контент, сериалы и юмор.' },
            { title: 'Кино ТВ', url: 'https://berezka.live', desc: 'Лучшие фильмы мирового кинематографа.' }
        ];

        this.create = function () {
            var inner = $('<div></div>');
            html.empty(); // Очистка перед созданием, чтобы не было дублей

            channels.forEach(function (channel) {
                var card = $('<div class="home-tv-card selector">' +
                    '<div class="home-tv-card__title">' + channel.title + '</div>' +
                    '<div class="home-tv-card__desc">' + channel.desc + '</div>' +
                '</div>');

                card.on('hover:enter', function () {
                    Lampa.Player.play({ url: channel.url, title: channel.title });
                });

                inner.append(card);
            });

            html.append(scroll.render());
            scroll.append(inner);
            return this.render();
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
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };
        
        this.create();
    });

    // 3. Добавление в меню с защитой от повторов
    function addPlugin() {
        // Если кнопка уже есть, ничего не делаем
        if ($('.menu__item[data-action="home_tv"]').length > 0) return;

        var menu_item = $('<li class="menu__item selector" data-action="home_tv">' +
            '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
            '<div class="menu__text">HOME TV</div>' +
            '</li>');

        menu_item.on('hover:enter click', function () {
            Lampa.Activity.push({
                title: 'HOME TV',
                component: 'home_tv_plugin',
                page: 1
            });
        });

        var list = $('.menu .menu__list');
        if (list.length) {
            var settings = list.find('[data-action="settings"]').closest('li');
            if (settings.length) settings.before(menu_item);
            else list.append(menu_item);
        }
    }

    // Запуск (только один раз через Listener или таймер)
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') addPlugin();
    });

    // Резервный таймер на случай медленной загрузки (остановится сам)
    var waitMenu = setInterval(function() {
        addPlugin();
        if ($('.menu__item[data-action="home_tv"]').length > 0) clearInterval(waitMenu);
    }, 1000);

})();

