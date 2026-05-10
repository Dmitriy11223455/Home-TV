(function () {
    'use strict';

    // 1. Your interface styles (unchanged)
    $('<style>' +
        '.home-tv { display: flex; width: 100%; height: 100%; padding: 1.5% 2%; box-sizing: border-box; }' +
        '.home-tv__menu { width: 20%; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 20px; }' +
        '.home-tv__list { width: 45%; padding: 0 30px; }' +
        '.home-tv__info { width: 35%; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 15px; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.07); border-radius: 10px; margin-bottom: 10px; border: 2px solid transparent; }' +
        '.home-tv-item.focus { border-color: #fff; background: rgba(255,255,255,0.15); transform: scale(1.03); }' +
        '.home-tv-item__num { font-size: 1.2em; color: #ffeb3b; margin-right: 15px; font-weight: bold; }' +
        '.home-tv-info__title { font-size: 2.5em; margin-bottom: 15px; color: #fff; }' +
        '.home-tv-menu__item { padding: 10px; opacity: 0.5; font-size: 1.3em; }' +
        '.home-tv-menu__item.focus { opacity: 1; color: #ffeb3b; }' +
    '</style>').appendTo('body');

    // 2. Your main plugin component (unchanged)
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [];
        var html = $('<div class="home-tv"></div>');
        var menu = $('<div class="home-tv__menu"></div>');
        var list = $('<div class="home-tv__list"></div>');
        var info = $('<div class="home-tv__info"></div>');

        this.create = function () {
            ['All channels', 'Main', 'Cinema'].forEach(function(cat) {
                menu.append('<div class="home-tv-menu__item">' + cat + '</div>');
            });

            var my_channels = [
                { title: 'Channel One', url: 'https://berezka.live', desc: 'The main broadcast of the country. Current news and shows.' },
                { title: 'TNT', url: 'https://site-b.net', desc: 'Entertainment content, series and humor.' }
            ];

            my_channels.forEach(function (channel, index) {
                var card = $('<div class="home-tv-item selector">' +
                                '<div class="home-tv-item__num">' + (index + 1).toString().padStart(3, '0') + '</div>' +
                                '<div class="home-tv-item__name">' + channel.title + '</div>' +
                             '</div>');
                
                card.on('hover:focus', function () {
                    info.html('<div class="home-tv-info__title">' + channel.title + '</div>' +
                              '<div class="home-tv-info__desc" style="font-size:1.2em; opacity:0.8">' + channel.desc + '</div>');
                    scroll.scrollTo(card);
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Starting stream...');
                    var network = new Lampa.Reguest();
                    network.native('http://cub.watch' + encodeURIComponent(channel.url), function (res) {
                        var match = /(https?:\/\/[^"']+\.m3u8[^"']*)/i.exec(res);
                        if (match) Lampa.Player.play({ url: match[0], title: channel.title });
                        else Lampa.Noty.show('Stream not found');
                    }, function(){ Lampa.Noty.show('Proxy error'); }, false, {dataType: 'text'});
                });

                list.append(card);
                items.push(card);
            });

            html.append(menu).append(list).append(info);
            scroll.append(list);
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
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_main');
        };

        this.create();
    });

    // 3. Fixed addition to the left menu (Logic of Gemini)
    function injectMenu() {
        if ($('li[data-action="home_tv"]').length > 0) return;
        
        var menu_list = $('.menu__list, .menu__items, .menu .list');
        if (menu_list.length > 0) {
            var item = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="white"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
                '</li>');

            item.on('hover:enter click', function () {
                $('body').removeClass('menu--open'); // Close the menu curtain
                Lampa.Activity.push({ 
                    title: 'HOME TV', 
                    component: 'home_tv_plugin',
                    page: 1 
                });
            });

            // Insert before settings for order
            var set = menu_list.find('[data-action="settings"]');
            if (set.length > 0) set.before(item); 
            else menu_list.append(item);
        }
    }

    // Safe launch of injection
    if (window.appready) injectMenu();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') injectMenu();
        });
    }

})();
