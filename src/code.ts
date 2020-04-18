import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';

const WINDOW_WIDTH = 290;
const WINDOW_HEIGHT = 600;

figma.showUI(__html__, {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
});

const storeClientData = async (key, val) => {
    await figma.clientStorage.setAsync(key, val);
};

const retrieveClientData = async key => {
    return await figma.clientStorage.getAsync(key);
};

figma.ui.onmessage = async msg => {
    if (msg.type === 'init') {
        const newState = {};
        const savedState = await retrieveClientData('pluginState');
        mergeWith(
            newState,
            msg.initialState,
            savedState,
            (objValue, srcValue) => {
                if (isArray(objValue) && isArray(srcValue)) {
                    return srcValue;
                }
            },
        );
        figma.ui.postMessage(newState);
    }

    if (msg.type === 'saveState') {
        await storeClientData('pluginState', msg.params);
    }

    if (msg.type === 'run') {
        const nodes = figma.currentPage.selection;

        if (nodes.length <= 1) {
            (figma as any).notify(
                'I need two or more text elements to sort 🤦',
            );
            return;
        }

        nodes.map(node => {
            if (node.type !== 'TEXT') {
                (figma as any).notify('This only works on text 🤦');
                return;
            }
        });

        const textNodes = nodes as TextNode[];

        const values = textNodes.map(node => node.characters);

        values.sort((a, b) => {
            const aInt = parseInt(a);
            const bInt = parseInt(b);
            return aInt - bInt;
        });

        if (msg.params.sortOrder === 'desc') {
            values.reverse();
        }

        textNodes.map(async (node, index) => {
            const len = node.characters.length;

            for (let i = 0; i < len; i++) {
                await figma.loadFontAsync(
                    node.getRangeFontName(i, i + 1) as FontName,
                );
            }

            node.characters = values[index];
        });
    }

    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
