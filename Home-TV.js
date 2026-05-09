(function () {
    'use strict';

    function startPlugin() {
        Lampa.Component.add('hybrid_plugin', function (object, exam) {
            var network = new Lampa.Request();
            var scroll = new Lampa.Scroll({mask:true, over:true});
            var items = [];
            var html = $('<div></div>');

            var sources = [
                {
                    name: 'Сайт А (Название)',
                    base_url: 'https://site-a.com',
                    regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i, 
                    channels: [
                        { title: 'Первый канал', path: '/page1.html' },
                        { title: 'Россия 1', path: '/page2.html' }
                    ]
                },
                {
                    name: 'Сайт Б (Название)',
                    base_url: 'https://site-b.net',
                    regex: /file:"(.*?\.m3u8)"/i, 
                    channels: [
                        { title: 'ТНТ', path: '/tnt-online' },
                        { title: 'СТС', path: '/ctc-online' }
                    ]
                }
            ];

            this.create = function () {
                var _this = this;
                sources.forEach(function (source) {
                    var head = $('<div class="category__title">' + source.name + '</div>');
                    html.append(head);

                    source.channels.forEach(function (channel) {
                        var card = Lampa.Template.get('button_item', {title: channel.title});
                        
                        card.on('hover:enter', function () {
                            Lampa.Noty.show('Запрос к ' + source.name);
                            var fullUrl = source.base_url + channel.path;

                            network.native(fullUrl, function (response) {
                                var match = source.regex.exec(response);
                                if (match) {
                                    var streamUrl = match[1] ? match[1] : match[0];
                                    streamUrl = streamUrl.replace(/["']/g, '').trim();

                                    Lampa.Player.play({
                                        url: streamUrl,
                                        title: channel.title
                                    });
                                } else {
                                    Lampa.Noty.error('Ссылка на поток не найдена');
                                }
                            }, function () {
                                Lampa.Noty.error('Ошибка доступа к сайту');
                            }, false, {dataType: 'text'});
                        });
                        
                        html.append(card);
                        items.push(card);
                    });
                });
                scroll.append(html);
            }

            this.render = function () { return scroll.render(); }
            
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
            }

            this.destroy = function(){
                network.clear();
                scroll.destroy();
                html.remove();
                items = [];
            }
        });

        function addMenuItem() {
            if ($('.menu .menu__list [data-action="hybrid"]').length) return;

            var menu_item = $('<li class="menu__item selector" data-action="hybrid">' +
                '<div class="menu__ico"><svg viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H8v-2h4V7h2v4h4v2h-4v4z"/></svg></div>' +
                '<div class="menu__text">Гибрид ТВ</div>' +
                '</li>');

            menu_item.on('hover:enter', function () {
                Lampa.Activity.push({ title: 'Каналы', component: 'hybrid_plugin' });
            });

            $('.menu .menu__list').append(menu_item);
        }

        // Таймер для вставки в меню (решает проблему "невидимости")
        var waitMenu = setInterval(function() {
            if ($('.menu .menu__list').length) {
                addMenuItem();
                clearInterval(waitMenu);
            }
        }, 500);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
