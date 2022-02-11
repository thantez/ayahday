// based on https://gitlab.com/KRypt0n_/an-anime-game-launcher/-/raw/main/scripts/bundle-appimage.cjs

const path = require('path');

// Require bundler
const { Bundler } = require('neutralino-appimage-bundler');

// Create an object with some params
const bundler = new Bundler({
    // .desktop file properties
    desktop: {
        // Name field
        name: 'Ayah Day',

        // Path to the icon
        icon: path.join(__dirname, '../www/icon.png'),

        // Categories (defult is Utilities)
        categories: ['Education', 'X-Religion', 'X-Islam']
    },

    // Neutralino binary info
    binary: {
        // Name of the binary (cli.binaryName)
        name: 'ayahday',

        // Dist folder path
        dist: path.join(__dirname, '../dist')
    },

    // Should AppImage contain Neutralino's dependencies or not
    // If true, then AppImage will contain binary's shared libraries
    includeLibraries: true,

    // Path to the appimage to save
    output: path.join(__dirname, '../dist/AyahDay.AppImage'),

    // Application version
    version: '0.1'
});

// Bundle project
bundler.bundle();

