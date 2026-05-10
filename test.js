(function () {
    'use strict';

    var manifest = {
        type: 'video',
        version: '1.3.0',
        name: 'HOME TV',
        description: 'IPTV парсер с динамическим меню сайтов',
        component: 'home_tv'
    };
    Lampa.Manifest.plugins = manifest;

    function addTemplates() {
        Lampa.Template.add('home_tv_layout', `
            <div class="home-tv-container" style="display: flex; height: 100%; padding: 10px; background: #0e0e0e;">
                <div class="htv-panel htv-menu" style="width: 25%; border-right: 2px solid rgba(255,255,255,0.05); padding: 15px;">
                    <div class="htv-label" style="color: #f39c12; font-size: 1.8em; margin-bottom: 20px; font-weight: 800; text-align: center;">HOME TV</div>
                    <div class="htv-categories-list scroll"></div>
                </div>
                <div class="htv-panel htv-channels" style="width: 40%; border-right: 2px solid rgba(255,255,255,0.05); padding: 0 15px;">
                    <div class="htv-label htv-current-site" style="color: rgba(255,255,255,0.5); font-size: 1.1em; margin-bottom: 15px; text-transform: uppercase;">Выберите источник</div>
                    <div class="htv-chan-scroll scroll" style="height: calc(100% - 50px);"></div>
                </div>
                <div class="htv-panel htv-details" style="width: 35%; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <img class="htv-info-logo" src="" style="width: 200px; height: 200px; object-fit: contain; border-radius: 20px; background: rgba(255,255,255,0.02); margin-bottom: 20px; display: none;" />
                    <div class="htv-info-name" style="font-size: 2em; font-weight: bold; text-align: center; color: #fff;"></div>
                    <div class="htv-info-desc" style="color: rgba(255,255,255,0.4); text-align: center; margin-top: 15px;"></div>
                </div>
            </div>
        `);

        Lampa.Template.add('home_tv_item', `
            <div class="htv-item selector" style="padding: 12px 15px; margin-bottom: 8px; border-radius: 8px; background: rgba(255,255,255,0.03); display: flex; align-items: center; cursor: pointer;">
                <div class="htv-item-num" style="width: 30px; color: #f39c12; font-weight: bold; font-size: 0.8em;"></div>
                <img class="htv-item-icon" src="" style="width: 30px; height: 30px; margin-right: 12px; display: none; border-radius: 6px;" />
                <div class="htv-item-text" style="font-size: 1.1em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
            </div>
        `);
    }

    function HomeTVComponent() {
        var _this = this;
        var network = new Lampa.Reguest();
        var scrollChannels = new Lampa.Scroll({ mask: true, over: true });
        var html = document.createElement('div');
        
        // =========================================================
        // ВОТ ЗДЕСЬ ДОБАВЛЯТЬ НОВЫЕ САЙТЫ В ЛЕВОЕ МЕНЮ
        // =========================================================
        var sources = [
            { name: 'Березка ТВ', url: 'https://berezka.live', max: 109 },
            { name: 'Архив Каналов', url: 'https://berezka.live/archive', max: 50 },
            { name: 'Premium TV', url: 'https://example-site.com/iptv', max: 20 },
            { name: 'Детские', url: 'https://kids-iptv.ru', max: 15 },
            { name: 'Спорт', url: 'https://sport-tv.com', max: 80 }
        ];

        var state = {
            currentSource: null,
            page: 1,
            channels: [],
            loading: false,
            activeCol: 'menu',
            lastMenuFocus: null,
            lastChanFocus: null
        };

        this.create = function () {
            html.classList.add('home-tv-wrapper');
            html.append(Lampa.Template.get('home_tv_layout'));
            
            scrollChannels.onEnd = function() {
                if(!state.loading && state.currentSource && state.page <= state.currentSource.max) _this.loadData();
            };
            html.querySelector('.htv-chan-scroll').append(scrollChannels.render());

            this.renderMenu();
            return this.render();
        };

        // Логика отрисовки левого меню
        this.renderMenu = function() {
            var container = html.querySelector('.htv-categories-list');
            container.innerHTML = '';
            
            sources.forEach(function(source, index) {
                var item = Lampa.Template.get('home_tv_item');
                item.find('.htv-item-text').text(source.name);
                item.find('.htv-item-num').text(index + 1);
                
                // При наведении/фокусе запоминаем элемент
                item.on('hover:focus', function() {
                    state.lastMenuFocus = item[0];
                });

                // При клике (Enter) загружаем каналы этого сайта
                item.on('hover:enter', function() {
                    state.currentSource = source;
                    state.page = 1;
                    state.channels = [];
                    scrollChannels.clear();
                    html.querySelector('.htv-current-site').innerText = "Источник: " + source.name;
                    
                    _this.loadData();
                    
                    // Переключаем управление на список каналов
                    state.activeCol = 'channels';
                    _this.toggle();
                });

                container.append(item[0]);
            });
        };

        this.loadData = function() {
            if(state.loading || !state.currentSource) return;
            state.loading = true;
            Lampa.Activity.loader(true);

            var url = state.currentSource.url + '/?page=' + state.page;
            var proxy = 'http://cub.watch/proxy?q=' + encodeURIComponent(url);
            
            network.silent(proxy, function(res) {
                var content = res.contents || res;
                _this.parseHTML(content);
                state.page++;
                state.loading = false;
                Lampa.Activity.loader(false);
            }, function() {
                state.loading = false;
                Lampa.Activity.loader(false);
                Lampa.Noty.show('Ошибка соединения с ' + state.currentSource.name);
            }, false, { dataType: 'text' });
        };

        this.parseHTML = function(data) {
            var regex = /<a[^>]+href="([^"]+)"[^>]*>.*?<img[^>]+src="([^"]+)".*?>(.*?)<\/a>/gi;
            var match;
            var found = [];
            while ((match = regex.exec(data)) !== null) {
                found.push({
                    id: state.channels.length + found.length + 1,
                    link: match[1].indexOf('http') === 0 ? match[1] : state.currentSource.url + match[1],
                    img: match[2].indexOf('http') === 0 ? match[2] : state.currentSource.url + match[2],
                    name: match[3].replace(/<[^>]*>/g, '').trim()
                });
            }
            state.channels = state.channels.concat(found);
            this.renderChannels(found);
        };

        this.renderChannels = function(items) {
            items.forEach(function(item) {
                var el = Lampa.Template.get('home_tv_item');
                el.find('.htv-item-num').text(item.id);
                el.find('.htv-item-text').text(item.name);
                if(item.img) el.find('.htv-item-icon').attr('src', item.img).show();

                el.on('hover:focus', function() {
                    state.lastChanFocus = el[0];
                    _this.updateInfo(item);
                    scrollChannels.update(el);
                });
                el.on('hover:enter', function() { _this.getStream(item); });
                scrollChannels.append(el);
            });
        };

        this.updateInfo = function(item) {
            var info = html.querySelector('.htv-details');
            $(info).find('.htv-info-name').text(item.name);
            $(info).find('.htv-info-desc').text("Сайт: " + state.currentSource.name + "\nСтраница: " + (state.page-1));
            if(item.img) $(info).find('.htv-info-logo').attr('src', item.img).show();
        };

        this.getStream = function(item) {
            Lampa.Activity.loader(true);
            network.silent('http://cub.watch/proxy?q=' + encodeURIComponent(item.link), function(res) {
                Lampa.Activity.loader(false);
                var m3u8 = /(https?:\/\/[^"']+\.m3u8[^"']*)/i.exec(res.contents || res);
                if(m3u8) {
                    Lampa.Player.play({ title: item.name, url: m3u8[1], tv: true });
                } else Lampa.Noty.show('Ссылка .m3u8 не найдена');
            }, function() { Lampa.Activity.loader(false); });
        };

        this.toggle = function () {
            Lampa.Controller.add('home_tv_ctrl', {
                toggle: function() {
                    var target = state.activeCol === 'menu' ? html.querySelector('.htv-categories-list') : scrollChannels.render();
                    Lampa.Controller.collectionSet(target);
                    Lampa.Controller.collectionFocus(state.activeCol === 'menu' ? state.lastMenuFocus : state.lastChanFocus, target);
                },
                right: function() { 
                    if(state.activeCol === 'menu' && state.channels.length > 0) { 
                        state.activeCol = 'channels'; 
                        Lampa.Controller.toggle('home_tv_ctrl'); 
                    } 
                },
                left: function() { 
                    if(state.activeCol === 'channels') { 
                        state.activeCol = 'menu'; 
                        Lampa.Controller.toggle('home_tv_ctrl'); 
                    } else {
                        Lampa.Controller.toggle('menu'); 
                    }
                },
                up: function() { Navigator.move('up'); },
                down: function() { Navigator.move('down'); },
                back: function() { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('home_tv_ctrl');
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scrollChannels.destroy(); $(html).remove(); };
    }

    function init() {
        addTemplates();
        Lampa.Component.add('home_tv', HomeTVComponent);
        var menuBtn = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></div><div class="menu__text">HOME TV</div></li>');
        menuBtn.on('hover:enter', function () { Lampa.Activity.push({ title: 'HOME TV', component: 'home_tv', page: 1 }); });
        $('.menu .menu__list').eq(0).append(menuBtn);
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();
