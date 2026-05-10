(function () {
    'use strict';

    // 1. СТИЛИ (Ваши + исправления для видимости)
    var styles = '<style>' +
        '.home-tv { display: flex; width: 100%; height: 100%; padding: 1.5% 2%; box-sizing: border-box; background: #000; position: absolute; top:0; left:0; z-index:10; }' +
        '.home-tv__menu { width: 25%; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 20px; overflow-y: auto; }' +
        '.home-tv__list { width: 40%; padding: 0 30px; overflow-y: auto; }' +
        '.home-tv__info { width: 35%; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 15px; display: flex; flex-direction: column; }' +
        '.home-tv-item { display: flex; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.07); border-radius: 10px; margin-bottom: 10px; border: 2px solid transparent; cursor: pointer; }' +
        '.home-tv-item.focus { border-color: #f39c12; background: rgba(255,255,255,0.15); transform: scale(1.03); }' +
        '.home-tv-item__num { font-size: 1.2em; color: #f39c12; margin-right: 15px; font-weight: bold; }' +
        '.home-tv-menu__item { padding: 15px; opacity: 0.5; font-size: 1.4em; margin-bottom: 8px; border-radius: 10px; background: rgba(255,255,255,0.03); }' +
        '.home-tv-menu__item.focus { opacity: 1; background: #f39c12; color: #000; font-weight: bold; }' +
        '.home-tv-info__title { font-size: 2.5em; color: #fff; margin-bottom: 15px; }' +
        '</style>';
    
    if (!$('style:contains(".home-tv")').length) $(styles).appendTo('body');

    // 2. КОМПОНЕНТ ПЛАГИНА
    Lampa.Component.add('home_tv_plugin', function (object, exam) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var html = $('<div class="home-tv"></div>');
        var menu = $('<div class="home-tv__menu"></div>');
        var list = $('<div class="home-tv__list"></div>');
        var info = $('<div class="home-tv__info"></div>');
        var last_item;

        // Данные из вашего запроса
        var data_sources = [
            {
                category: 'Основные',
                channels: [
                    { title: 'Первый канал', url: 'https://berezka.live', desc: 'Главный эфир страны. Актуальные новости и шоу.' },
                    { title: 'ТНТ', url: 'https://site-b.net', desc: 'Развлекательный контент, сериалы и юмор.' }
                ]
            },
            {
                category: 'Кино',
                channels: [
                    { title: 'Кино ТВ', url: 'https://berezka.live/cinema', desc: 'Лучшие фильмы и премьеры в HD качестве.' }
                ]
            }
        ];

        this.create = function () {
            // Создаем левое меню категорий
            data_sources.forEach(function(source) {
                var m_item = $('<div class="home-tv-menu__item selector">' + source.category + '</div>');
                m_item.on('hover:enter', function() {
                    _this.renderChannels(source.channels);
                });
                menu.append(m_item);
            });

            html.append(menu).append(list).append(info);
            this.renderChannels(data_sources[0].channels); // Загрузка первой категории
            return this.render();
        };

        this.renderChannels = function(channels) {
            list.empty();
            channels.forEach(function (channel, index) {
                var card = $('<div class="home-tv-item selector">' +
                                '<div class="home-tv-item__num">' + (index + 1).toString().padStart(3, '0') + '</div>' +
                                '<div class="home-tv-item__name">' + channel.title + '</div>' +
                             '</div>');

                card.on('hover:focus', function () {
                    last_item = card[0];
                    info.html('<div class="home-tv-info__title">' + channel.title + '</div>' +
                              '<div class="home-tv-info__desc" style="font-size:1.3em; opacity:0.6">' + channel.desc + '</div>');
                });

                card.on('hover:enter', function () {
                    Lampa.Noty.show('Запуск: ' + channel.title);
                    var network = new Lampa.Reguest();
                    network.native('http://cub.watch/proxy?q=' + encodeURIComponent(channel.url), function (res) {
                        var match = /(https?:\/\/[^"']+\.m3u8[^"']*)/i.exec(res);
                        if (match) Lampa.Player.play({ url: match[0], title: channel.title });
                        else Lampa.Noty.show('Поток не найден');
                    }, function(){ Lampa.Noty.show('Ошибка прокси'); }, false, {dataType: 'text'});
                });

                list.append(card);
            });
            Lampa.Controller.toggle('home_tv_ctrl'); // Обновляем контроллер
        };

        this.render = function () { return html; };

        this.active = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(last_item || html.find('.selector')[0], html);
                },
                up: function () { Lampa.Controller.move('up'); },
                down: function () { Lampa.Controller.move('down'); },
                right: function () { Lampa.Controller.move('right'); },
                left: function () { Lampa.Controller.move('left'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };

        this.create();
    });

    // 3. ФУНКЦИЯ ВКЛЕЙКИ В МЕНЮ (С защитой)
    function addMenuItem() {
        if ($('li[data-action="home_tv"]').length > 0) return; // Если уже есть, не дублируем

        var menu_list = $('.menu .menu__list'); // Ищем основной список
        if (menu_list.length) {
            var button = $('<li class="menu__item selector" data-action="home_tv">' +
                '<div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" fill="#f39c12"/></svg></div>' +
                '<div class="menu__text">HOME TV</div>' +
                '</li>');

            button.on('hover:enter click', function () {
                Lampa.Activity.push({
                    title: 'HOME TV',
                    component: 'home_tv_plugin'
                });
            });

            // Вставляем перед настройками или просто в конец
            var settings = menu_list.find('[data-action="settings"]').closest('li');
            if (settings.length) settings.before(button);
            else menu_list.append(button);
            
            console.log('HOME TV: Кнопка добавлена');
        }
    }

    // Запуск проверки наличия меню каждые 2 секунды (на случай долгой загрузки)
    var checkMenu = setInterval(function() {
        addMenuItem();
    }, 2000);

    // Дополнительный запуск при старте приложения
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') addMenuItem();
    });

})();
