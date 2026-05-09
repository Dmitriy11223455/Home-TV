(function () {
    'use strict';

    // Функция запуска
    function startPlugin() {
        if (window.home_tv_plugin_loaded) return;
        window.home_tv_plugin_loaded = true;

        // 1. КОМПОНЕНТ (Страница с каналами)
        Lampa.Component.add('home_tv_plugin', function (object, exam) {
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div></div>');

            this.create = function () {
                var card = Lampa.Template.get('button_item', {title: 'ТЕСТОВЫЙ КАНАЛ'});
                card.on('hover:enter', function () { 
                    Lampa.Noty.show('Нажато!'); 
                });
                html.append(card);
                items.push(card);
                scroll.append(html);
            };

            this.render = function () { return scroll.render(); };
            this.active = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(items, html);
                        Lampa.Controller.navigate('content');
                    },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
        });

        // 2. СИЛОВАЯ ОТРИСОВКА В МЕНЮ
        function addMenu() {
            if ($('.menu__list [data-action="home_tv"]').length) return;

            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
            '</li>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
            });

            // Пробуем вставить в разные места меню
            if ($('.menu__list').length) {
                $('.menu__list').append(item);
                console.log('Home TV: Added to menu');
            }
        }

        // Пытаемся добавить пункт меню каждые 3 секунды (на случай перерисовки Лампы)
        setInterval(addMenu, 3000);
        Lampa.Noty.show('HOME TV: Плагин активен!');
    }

    // Ждем готовности
    if (window.appready) startPlugin();
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') startPlugin();
    });
})();
