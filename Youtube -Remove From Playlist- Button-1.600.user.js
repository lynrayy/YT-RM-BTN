// ==UserScript==
// @name      Youtube "Remove From Playlist" Button
// @namespace http://tampermonkey.net/
// @version   1.6
// @description Adds a button next to the three dots menu to remove videos from a playlist with one click on YouTube
// @author    Lynrayy + art13
// @match     https://www.youtube.com/*
// @grant     none
// @license   MIT
// @source   https://github.com/lynrayy/YT-RM-BTN
// @require placebo.easy
// ==/UserScript==

(function() {
    'use strict';

    console.log('Script started');

    function addRemoveButton(video) {
        console.log('Adding remove button');
        const menuRenderer = video.querySelector('ytd-menu-renderer');
        if (!menuRenderer || menuRenderer.querySelector('.remove-button')) return;

        const buttonContainer = document.createElement('button');
        buttonContainer.className = 'remove-button style-scope ytd-menu-renderer';
        buttonContainer.style.cssText = 'background: none; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center; margin-right: 10px;';

        // Создаём SVG иконку
        const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        trashIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        trashIcon.setAttribute('viewBox', '0 0 24 24');
        trashIcon.setAttribute('width', '24');
        trashIcon.setAttribute('height', '24');
        trashIcon.style.cssText = 'fill: #030303; vertical-align: middle;';

        // Добавляем путь для иконки корзины
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z');
        trashIcon.appendChild(path);

        buttonContainer.appendChild(trashIcon);

        buttonContainer.addEventListener('click', async () => {
            const menuButton = video.querySelector('ytd-menu-renderer yt-icon-button#button');
            if (!menuButton) return;

            menuButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));

            const removeButton = document.querySelector('ytd-menu-service-item-renderer:nth-child(3) tp-yt-paper-item');
            if (removeButton) {
                removeButton.click();
            } else {
                alert('It was not possible to delete the video. Please try again.');
            }
        });

        // Меняем flex-свойства для корректного выравнивания
        menuRenderer.style.display = 'flex';
        menuRenderer.style.alignItems = 'center';
        menuRenderer.insertBefore(buttonContainer, menuRenderer.firstChild);
    }

    function addRemoveButtons() {
        console.log('Adding remove buttons to all videos');
        const videoContainers = document.querySelectorAll('ytd-playlist-video-renderer');
        videoContainers.forEach(addRemoveButton);
    }

    function init() {
        console.log('Initializing script');
        addRemoveButtons();

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches('ytd-playlist-video-renderer')) {
                        addRemoveButton(node);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('yt-navigate-finish', addRemoveButtons);
    }

    init();
})();
