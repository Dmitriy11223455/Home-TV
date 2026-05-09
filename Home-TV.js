(function () {
    'use strict';

    function startPlugin() {
        // 1. РЕГИСТРАЦИЯ В РЕЕСТРЕ (Чтобы Lampa "видела" плагин)
        Lampa.Plugins.add({
            name: 'Гибрид ТВ',
            version: '1.3.0',
            description: 'Запуск каналов через Настройки',
            auth: false
        });

        // 2. КОМПОНЕНТ КАНАЛОВ (ТВОЯ ЛОГИКА)
        Lampa.Component.add('hybrid_tv', function (object, exam) {
            var scroll = new Lampa.Scroll({mask:true, over:true});
            var items = [];
            var html = $('<div></div>');
            
            this.create = function () {
                var card = Lampa.Template.get('button_item', {title: 'Тестовый Канал (Нажми меня)'});
                card.on('hover:enter', function () { Lampa.Noty.show('Логика работает!'); });
                html.append(card);
                items.push(card);
                scroll.append(html);
            };
            this.render = function () { return scroll.render(); };
            this.active = function () {
                Lampa.Controller.add('content', {
                    toggle: function () { Lampa.Controller.collectionSet(items, html); Lampa.Controller.navigate('content'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
        });

        // 3. ДОБАВЛЕНИЕ В НАСТРОЙКИ (ЭТОТ МЕТОД НЕЛЬЗЯ ЗАБЛОКИРОВАТЬ)
        Lampa.Settings.add({
            title: 'Гибрид ТВ',
            type: 'button',
            icon: '<svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
            onRender: function (html) {
                var btn = $('<div class="settings-param selector"><div class="settings-param__name">ОТКРЫТЬ ГИБРИД ТВ</div><div class="settings-param__value">Нажми для запуска</div></div>');
                
                btn.on('hover:enter', function () {
                    // Принудительный запуск компонента
                    Lampa.Activity.push({ title: 'Каналы', component: 'hybrid_tv' });
                });

                html.append(btn);
            }
        });
        
        Lampa.Noty.show('Гибрид ТВ: Ищите в Настройках!');
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
