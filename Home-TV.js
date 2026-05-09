(function () {
    'use strict';

    function startPlugin() {
        var network = new Lampa.Request();

        // --- 1. СТРАНИЦА С КАНАЛАМИ (КОМПОНЕНТ) ---
        Lampa.Component.add('hybrid_tv', function (object, exam) {
            var scroll = new Lampa.Scroll({mask:true, over:true});
            var items = [];
            var html = $('<div></div>');
            var _this = this;

            this.create = function () {
                // ТВОИ КАНАЛЫ (добавляй новые сюда по аналогии)
                var data = [
                    {
                        title: 'Общие',
                        channels: [
                            { title: 'Первый канал', url: 'https://site-a.com', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i },
                            { title: 'Россия 1', url: 'https://site-a.com', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i }
                        ]
                    },
                    {
                        title: 'Развлекательные',
                        channels: [
                            { title: 'ТНТ', url: 'https://site-b.net', regex: /file:"(.*?\.m3u8)"/i },
                            { title: 'СТС', url: 'https://site-b.net', regex: /file:"(.*?\.m3u8)"/i }
                        ]
                    }
                ];

                data.forEach(function (cat) {
                    html.append('<div class="category__title">' + cat.title + '</div>');
                    var row = $('<div class="category__content"></div>');

                    cat.channels.forEach(function (channel) {
                        var card = Lampa.Template.get('button_item', {title: channel.title});
                        
                        card.on('hover:enter', function () {
                            Lampa.Noty.show('Парсинг сайта...');
                            var proxiedUrl = 'http://kulik.uz' + channel.url;

                            network.native(proxiedUrl, function (response) {
                                var match = channel.regex.exec(response);
                                if (match) {
                                    var stream = (match[1] ? match[1] : match[0]).replace(/["']/g, '').trim();
                                    Lampa.Player.play({ url: stream, title: channel.title });
                                } else { Lampa.Noty.error('Поток не найден'); }
                            }, function () { Lampa.Noty.error('Ошибка сети/прокси'); }, false, {dataType: 'text'});
                        });

                        row.append(card);
                        items.push(card);
                    });
                    html.append(row);
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
        });

        // --- 2. ЖЕСТКАЯ ОТРИСОВКА В МЕНЮ (МЕТОД FORCE) ---
        function forceAddMenu() {
            var menuList = $('.menu__list');
            if (menuList.length > 0 && !$('.menu__item[data-action="hybrid"]').length) {
                var item = $('<li class="menu__item selector" data-action="hybrid">' +
                    '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg></div>' +
                    '<div class="menu__text">ГИБРИД ТВ</div>' +
                    '</li>');

                item.on('hover:enter', function () {
                    Lampa.Activity.push({ title: 'Каналы', component: 'hybrid_tv' });
                });

                // Вставляем перед пунктом Настройки
                var settings = menuList.find('[data-action="settings"]');
                if (settings.length) settings.before(item);
                else menuList.append(item);
            }
        }

        setInterval(forceAddMenu, 2000);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
