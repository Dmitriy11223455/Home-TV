(function () {
    'use strict';

    function startPlugin() {
        Lampa.Component.add('my_kulik_plugin', function (object, exam) {
            var network = new Lampa.Reguest();
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div class="category-full"></div>');
            var body = $('<div class="category-full__body"></div>');

            // --- ТВОИ КАНАЛЫ (как в Кулик ТВ) ---
            var myChannels = [
                {
                    title: 'Первый канал',
                    url: 'https://site-a.com',
                    regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i,
                    img: 'https://nocookie.net'
                },
                {
                    title: 'ТНТ',
                    url: 'https://site-b.net',
                    regex: /file:"(.*?\.m3u8)"/i,
                    img: ''
                }
            ];

            this.create = function () {
                var _this = this;
                myChannels.forEach(function (item) {
                    // Создаем плитку (карточку) как в Кулике
                    var card = Lampa.Template.get('card', {
                        title: item.title,
                        release_year: 'TV'
                    });
                    
                    // Устанавливаем логотип
                    if(item.img) card.find('.card__img').attr('src', item.img);

                    card.on('hover:enter', function () {
                        Lampa.Noty.show('Поиск потока...');
                        
                        network.native(item.url, function (response) {
                            var found = response.match(item.regex);
                            if (found) {
                                var stream = found[1] ? found[1] : found[0];
                                Lampa.Player.play({
                                    url: stream.replace(/"/g, ''),
                                    title: item.title
                                });
                            } else {
                                Lampa.Noty.error('Ссылка не найдена');
                            }
                        }, function () {
                            Lampa.Noty.error('Сайт не отвечает');
                        }, false, {dataType: 'text'});
                    });
                    
                    body.append(card);
                    items.push(card);
                });

                html.append(body);
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

        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var menu_item = $('<li class="menu__item selector">' +
                    '<div class="menu__ico"><svg viewBox="0 0 24 24" fill="white"><path d="M21 7L12 2L3 7V17L12 22L21 17V7Z"/></svg></div>' +
                    '<div class="menu__text">Мой Кулик</div>' +
                    '</li>');

                menu_item.on('hover:enter', function () {
                    Lampa.Activity.push({ title: 'ТВ Каналы', component: 'my_kulik_plugin' });
                });
                $('.menu .menu__list').append(menu_item);
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();

