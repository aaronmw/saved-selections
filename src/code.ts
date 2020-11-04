const WINDOW_WIDTH = 240;
const WINDOW_HEIGHT = 250;
const PLUGIN_STATE_KEY = 'pluginState';

figma.showUI(__html__, {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
});

const notify = message => (figma as any).notify(message);

const setPluginState = async stateObj => {
    await figma.clientStorage.setAsync(PLUGIN_STATE_KEY, stateObj);
};

const getPluginState = async () => {
    return await figma.clientStorage.getAsync(PLUGIN_STATE_KEY);
};

const fontNameLoadHistory = {};

figma.ui.onmessage = async msg => {
    if (msg.type === 'init') {
        await figma.ui.postMessage({
            savedPluginState: await getPluginState(),
        });
    }

    if (msg.type === 'savePluginState') {
        await setPluginState(msg.pluginState);
    }

    if (msg.type === 'setWindowHeight') {
        await figma.ui.resize(WINDOW_WIDTH, msg.params.height || WINDOW_HEIGHT);
    }

    if (msg.type === 'findAndReplace') {
        const { isCaseSensitive, isRegExp, needle, replacement } = msg.params;
        const selectedNodes = figma.currentPage.selection;
        const selectedTextNodes = selectedNodes.filter(
            node => node.type === 'TEXT',
        );
        const textNodesOnPage = figma.currentPage.findAll(
            node => node.type === 'TEXT',
        );

        if (selectedNodes.length >= 1 && selectedTextNodes.length === 0) {
            notify('None of your selected nodes are text, so... 🤷');
            return;
        }

        if (textNodesOnPage.length === 0) {
            notify("There aren't any text nodes on this page... 🤔");
            return;
        }

        const textNodes =
            selectedTextNodes.length >= 1 ? selectedTextNodes : textNodesOnPage;

        textNodes.map(async node => {
            const castNode = node as TextNode;
            const numChars = castNode.characters.length;
            for (let i = 0; i < numChars; i++) {
                const fontName = (await castNode.getRangeFontName(
                    i,
                    i + 1,
                )) as FontName;
                const cacheKey = `${fontName.family}-${fontName.style}`;
                const isLoaded = fontNameLoadHistory[cacheKey];

                if (!isLoaded) {
                    await figma.loadFontAsync(fontName);
                    fontNameLoadHistory[cacheKey] = true;
                }
            }

            castNode.characters = castNode.characters.replace(
                new RegExp(
                    isRegExp
                        ? needle
                        : needle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                    isCaseSensitive ? 'g' : 'ig',
                ),
                replacement,
            );
        });

        notify('Done 👏');
    }

    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
