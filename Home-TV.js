(function () {
    'use strict';

    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [];
        var html = $('<div class="iptv-channels"></div>'); // Сетка как у Kulik TV

        this.create = function () {
            var my_channels = [
                { title: 'Первый канал', url: 'https://berezka.live', regex: /(https?:\/\/[^"']+\.m3u8[^"']*)/i },
                { title: 'ТНТ', url: 'https://site-b.net', regex: /file:"(.*?\.m3u8)"/i }
            ];

            my_channels.forEach(function (channel, index) {
                // Стиль карточки полностью скопирован с Kulik TV
                var card = $('<div class="iptv-channel selector layer--visible">' +
                                '<div class="iptv-channel__body">' +
                                    '<div class="iptv-channel__simb">' + channel.title.substring(0,1).toUpperCase() + '</div>' +
                                    '<div class="iptv-channel__name">' + channel.title + '</div>' +
                                '</div>' +
                                '<div class="iptv-channel__chn">' + (index + 1).toString().padStart(3, '0') + '</div>' +
                             '</div>');
                
                card.on('hover:enter', function () {
                    Lampa.Noty.show('Пробиваем блокировку...');
                    var network = new Lampa.Reguest();
                    var targetUrl = 'http://cub.watch' + channel.url;

                    network.native(targetUrl, function (response) {
                        var match = channel.regex.exec(response);
                        if (match) {
                            var stream = (match[1] || match[0]).replace(/["']/g, '').trim();
                            Lampa.Player.play({ url: stream, title: channel.title });
                        } else { Lampa.Noty.show('Поток не найден'); }
                    }, function () { 
                        var altUrl = 'https://corsproxy.io' + encodeURIComponent(channel.url);
                        network.native(altUrl, function(res){
                             var m = channel.regex.exec(res);
                             if(m) Lampa.Player.play({ url: (m[1] || m[0]).replace(/["']/g, '').trim(), title: channel.title });
                             else Lampa.Noty.show('Ошибка запроса');
                        }, function(){
                             Lampa.Noty.show('Блокировка браузера');
                        }, false, {dataType: 'text'});
                    }, false, {dataType: 'text'});
                });

                html.append(card);
                items.push(card);
            });

            scroll.append(html);
        };

        this.render = function () { return scroll.render(); };

        this.active = function () {
            // АДАПТАЦИЯ ПОД ПУЛЬТ
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    // Передаем весь массив элементов для корректной навигации
                    Lampa.Controller.collectionFocus(items[0], html); 
                },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.create();
    });

    function injectMenu() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        var menu = $('.menu__list, .menu__items, .menu .list');
        if (menu.length > 0) {
            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
                '</li>');

            item.on('hover:enter click', function () {
                $('body').removeClass('menu--open');
                Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv_plugin' });
            });

            var settings = menu.find('[data-action="settings"]');
            if (settings.length > 0) settings.before(item);
            else menu.append(item);
        }
    }

    setInterval(injectMenu, 2000);
})();

