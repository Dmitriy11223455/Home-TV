(function () {
    'use strict';

    function startPlugin() {
        // Регистрация компонента (внутренняя логика)
        Lampa.Component.add('hybrid_plugin', function (object, exam) {
            var network = new Lampa.Request();
            var scroll = new Lampa.Scroll({mask:true, over:true});
            var items = [];
            var html = $('<div></div>');

            // Твои источники
            var sources = [
                {
                    name: 'Мои Каналы',
                    base_url: 'https://google.com', // Замени на свой сайт
                    regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i, 
                    channels: [
                        { title: 'Тестовый канал', path: '/' }
                    ]
                }
            ];

            this.create = function () {
                var _this = this;
                sources.forEach(function (source) {
                    html.append('<div class="category__title">' + source.name + '</div>');
                    source.channels.forEach(function (channel) {
                        var card = Lampa.Template.get('button_item', {title: channel.title});
                        card.on('hover:enter', function () {
                            Lampa.Noty.show('Запрос к источнику...');
                            network.native(source.base_url + channel.path, function (response) {
                                var match = source.regex.exec(response);
                                if (match) {
                                    var url = (match[1] ? match[1] : match[0]).replace(/["']/g, '').trim();
                                    Lampa.Player.play({ url: url, title: channel.title });
                                } else { Lampa.Noty.error('Поток не найден'); }
                            }, function () { Lampa.Noty.error('Ошибка сети'); }, false, {dataType: 'text'});
                        });
                        html.append(card);
                        items.push(card);
                    });
                });
                scroll.append(html);
            };

            this.render = function () { return scroll.render(); };
            this.active = function () {
                Lampa.Controller.add('content', {
                    toggle: function () { Lampa.Controller.collectionSet(items, html); Lampa.Controller.navigate('content'); },
                    up: function () { Lampa.Controller.toggle('head'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
            this.destroy = function(){ network.clear(); scroll.destroy(); html.remove(); items = []; };
        });

        // Функция вставки в меню
        function addMenuItem() {
            if ($('.menu__list [data-action="hybrid"]').length) return; // Если уже есть, не дублировать

            var item = $('<li class="menu__item selector" data-action="hybrid">' +
                '<div class="menu__ico"><svg viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H8v-2h4V7h2v4h4v2h-4v4z"/></svg></div>' +
                '<div class="menu__text">Гибрид ТВ</div>' +
                '</li>');

            item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'Каналы', component: 'hybrid_plugin' });
            });

            $('.menu__list').append(item);
        }

        // Запуск проверки меню каждые 2 секунды (всего 10 раз)
        var tries = 0;
        var timer = setInterval(function() {
            addMenuItem();
            if (++tries > 10) clearInterval(timer);
        }, 2000);
    }

    // Ожидание готовности Lampa
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
