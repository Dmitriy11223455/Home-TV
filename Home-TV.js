(function () {
    'use strict';

    function start() {
        // Уведомление, чтобы мы увидели, что плагин вообще запустился
        Lampa.Noty.show('Плагин ТВ загружается...');

        Lampa.Component.add('my_tv_final', function (object, exam) {
            var network = new Lampa.Reguest();
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div class="category-full"><div class="category-full__body"></div></div>');
            var body = html.find('.category-full__body');

            var channels = [
                {title: 'Первый канал', url: 'https://google.com', regex: /(.*)/, img: ''}
            ];

            this.create = function () {
                var _this = this;
                channels.forEach(function (item) {
                    var card = Lampa.Template.get('card', {title: item.title, release_year: 'TV'});
                    card.on('hover:enter', function () {
                        Lampa.Noty.show('Работает!');
                    });
                    body.append(card);
                    items.push(card);
                });
                scroll.append(html);
            };

            this.render = function () { return scroll.render(); };
            this.active = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(items, html);
                        Lampa.Controller.navigate('content');
                    },
                    up: function () { Lampa.Controller.toggle('head'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
        });

        // Добавляем пункт в меню с задержкой 2 секунды (чтобы меню успело прогрузиться)
        setTimeout(function () {
            var menu_item = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="white"><path d="M21 7L12 2L3 7V17L12 22L21 17V7Z"/></svg></div><div class="menu__text">TV КАНАЛЫ</div></li>');
            menu_item.on('hover:enter', function () {
                Lampa.Activity.push({title: 'ТВ', component: 'my_tv_final'});
            });
            $('.menu .menu__list').append(menu_item);
            console.log('Plugin: Menu item added');
        }, 2000);
    }

    // Ждем готовности приложения
    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();

