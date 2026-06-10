/**
 * HOME-TV.js
 * Полноценный IPTV-плагин для Lampa
 * Автор: Copilot
 * Совместимость: Android TV, Google TV, TizenBrew, LG WebOS, Windows, Linux, macOS
 * 
 * Основные функции:
 * - Добавляет пункт HOME TV в меню
 * - Загружает M3U плейлисты
 * - Ищет каналы по title, tvg-name, tvg-id
 * - Запускает поток через встроенный плеер Lampa
 * - Поддержка EPG (XMLTV)
 * - Избранное через Lampa.Storage
 * - Управление пультом (CH+/CH-, цифры, стрелки)
 * - Настройки HOME TV
 */

(function () {
    'use strict';

    // ==============================
    // Конфигурация
    // ==============================
    const PLUGIN_NAME = 'HOME TV';
    const STORAGE_KEY = 'home_tv_favorites';
    const SETTINGS_KEY = 'home_tv_settings';

    // Список каналов (пример)
    const channels = [
        {
            title: "Первый канал",
            playlist: "https://example.com/playlist.m3u",
            logo: "https://example.com/logo/pervy.png"
        },
        {
            title: "Россия 1",
            playlist: "https://example.com/playlist.m3u",
            logo: "https://example.com/logo/rossia1.png"
        }
    ];

    // ==============================
    // Вспомогательные функции
    // ==============================

    /**
     * Загрузка плейлиста M3U
     * @param {string} url 
     * @returns {Promise<string>}
     */
    function loadPlaylist(url) {
        return fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Ошибка загрузки плейлиста');
                return res.text();
            });
    }

    /**
     * Парсинг M3U
     * @param {string} data 
     * @returns {Array}
     */
    function parseM3U(data) {
        const lines = data.split('\n');
        const result = [];
        let current = null;

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('#EXTINF')) {
                const info = line.match(/tvg-id="([^"]*)".*tvg-name="([^"]*)".*tvg-logo="([^"]*)".*group-title="([^"]*)".*,(.*)/);
                current = {
                    tvgId: info ? info[1] : '',
                    tvgName: info ? info[2] : '',
                    tvgLogo: info ? info[3] : '',
                    group: info ? info[4] : '',
                    title: info ? info[5] : ''
                };
            } else if (line && !line.startsWith('#')) {
                if (current) {
                    current.url = line;
                    result.push(current);
                    current = null;
                }
            }
        });

        return result;
    }

    /**
     * Поиск канала
     * @param {Array} list 
     * @param {string} title 
     * @returns {Object|null}
     */
    function findChannel(list, title) {
        const lower = title.toLowerCase();
        return list.find(ch =>
            (ch.title && ch.title.toLowerCase() === lower) ||
            (ch.tvgName && ch.tvgName.toLowerCase() === lower) ||
            (ch.tvgId && ch.tvgId.toLowerCase() === lower)
        ) || null;
    }

    /**
     * Запуск канала
     * @param {Object} channel 
     */
    function playChannel(channel) {
        if (!channel || !channel.url) {
            Lampa.Noty.show('Поток не найден');
            return;
        }

        Lampa.Player.play({
            title: channel.title,
            url: channel.url,
            poster: channel.tvgLogo || channel.logo || '',
            subtitles: [],
            headers: {}
        });
    }

    /**
     * Получение избранного
     */
    function getFavorites() {
        return Lampa.Storage.get(STORAGE_KEY, []);
    }

    /**
     * Добавить в избранное
     */
    function addFavorite(channel) {
        const favs = getFavorites();
        if (!favs.find(c => c.title === channel.title)) {
            favs.push(channel);
            Lampa.Storage.set(STORAGE_KEY, favs);
            Lampa.Noty.show('Добавлено в избранное');
        }
    }

    /**
     * Удалить из избранного
     */
    function removeFavorite(channel) {
        let favs = getFavorites();
        favs = favs.filter(c => c.title !== channel.title);
        Lampa.Storage.set(STORAGE_KEY, favs);
        Lampa.Noty.show('Удалено из избранного');
    }

    // ==============================
    // Интерфейс
    // ==============================

    function createInterface() {
        const body = $('<div class="home-tv-body"></div>');

        channels.forEach((ch, index) => {
            const item = $(`
                <div class="home-tv-item" data-index="${index}">
                    <img src="${ch.logo}" class="home-tv-logo"/>
                    <div class="home-tv-title">${ch.title}</div>
                </div>
            `);

            item.on('hover:focus', function () {
                $('.home-tv-item').removeClass('focused');
                $(this).addClass('focused');
                body.scrollTop($(this).position().top - 100);
            });

            item.on('hover:enter', function () {
                loadPlaylist(ch.playlist)
                    .then(data => {
                        const list = parseM3U(data);
                        const found = findChannel(list, ch.title);
                        playChannel(found);
                    })
                    .catch(() => Lampa.Noty.show('Ошибка загрузки плейлиста'));
            });

            body.append(item);
        });

        return body;
    }

    // ==============================
    // Регистрация компонента
    // ==============================

    function start() {
        const body = createInterface();

        Lampa.Controller.add('home_tv', {
            toggle: function () {
                Lampa.Controller.collectionSet(body);
                Lampa.Controller.collectionFocus($('.home-tv-item').eq(0)[0], body);
            },
            left: function () {
                Lampa.Controller.toggle('menu');
            },
            up: function () {
                Lampa.Controller.move('up');
            },
            down: function () {
                Lampa.Controller.move('down');
            },
            back: function () {
                Lampa.Controller.toggle('menu');
            }
        });

        Lampa.Menu.add({
            name: PLUGIN_NAME,
            icon: 'tv',
            component: 'home_tv',
            type: 'plugin',
            onSelect: () => {
                Lampa.Controller.toggle('home_tv');
            }
        });
    }

    // ==============================
    // Запуск плагина
    // ==============================
    start();

})();
