import clone from 'lodash/clone';
import get from 'lodash/get';
import omit from 'lodash/omit';
import setWith from 'lodash/setWith';

const WINDOW_WIDTH = 240;
const WINDOW_HEIGHT = 250;

figma.showUI(__html__, {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
});

const notify = message => (figma as any).notify(message);

const PLUGIN_STATE_KEY = 'pluginState';
const PAGE_STATE_KEY = 'pageState';

const setPluginState = async val => {
    await figma.clientStorage.setAsync(PLUGIN_STATE_KEY, val);
};

const getPluginState = async () => {
    return await figma.clientStorage.getAsync(PLUGIN_STATE_KEY);
};

const INITIAL_PAGE_STATE = {
    savedSelections: {},
};

const setPageState = async value => {
    await figma.currentPage.setPluginData(
        PAGE_STATE_KEY,
        JSON.stringify(value),
    );
};

const resetPageState = async () => {
    await figma.currentPage.setPluginData(
        PAGE_STATE_KEY,
        JSON.stringify(INITIAL_PAGE_STATE),
    );
};

const getPageState = async () => {
    const pageStateStringified = await figma.currentPage.getPluginData(
        PAGE_STATE_KEY,
    );
    const pageState = pageStateStringified.length
        ? JSON.parse(pageStateStringified)
        : INITIAL_PAGE_STATE;

    return pageState;
};

const updatePageState = async ({ pathToValue, newValue }) => {
    const currentPageState = await getPageState();
    const newPageState = setWith(
        clone(currentPageState),
        pathToValue,
        newValue,
        clone,
    );
    await setPageState(newPageState);
};

const refreshUI = async () => {
    // await resetPageState();
    await figma.ui.postMessage({
        savedPluginState: await getPluginState(),
        savedPageState: await getPageState(),
    });
};

figma.ui.onmessage = async msg => {
    const pluginState = await getPluginState();
    const pageState = await getPageState();

    if (msg.type === 'setWindowHeight') {
        await figma.ui.resize(WINDOW_WIDTH, msg.params.height || WINDOW_HEIGHT);
    }

    if (msg.type === 'init') {
        await refreshUI();
    }

    if (msg.type === 'savePluginState') {
        await setPluginState(msg.params);
    }

    if (msg.type === 'savePageState') {
        await setPageState(msg.params);
    }

    if (msg.type === 'saveSelection') {
        const selectedNodes = figma.currentPage.selection;

        if (selectedNodes.length === 0) {
            notify('Select something first!');
            return;
        }

        const selectionID = get(
            msg.params,
            'newSelectionID',
            get(msg.params, 'selectionID'),
        );

        const label = get(
            pageState,
            ['savedSelections', selectionID, 'label'],
            'Untitled',
        );

        await updatePageState({
            pathToValue: ['savedSelections', selectionID],
            newValue: {
                nodeIDs: selectedNodes.map(node => node.id),
                label,
            },
        });

        await refreshUI();

        notify('💾 Selection saved');
    }

    if (msg.type === 'relabelSavedSelection') {
        const { selectionID, newValue } = msg.params;

        await updatePageState({
            pathToValue: ['savedSelections', selectionID, 'label'],
            newValue,
        });

        await refreshUI();

        notify('✍️ Selection renamed');
    }

    if (msg.type === 'restoreSelection') {
        const shouldAppendInstead = get(
            msg.params,
            'shouldAppendInstead',
            false,
        );

        const { selectionID } = msg.params;
        const savedSelection = get(pageState, ['savedSelections', selectionID]);
        const { nodeIDs } = savedSelection;

        const remainingNodesInSelection = nodeIDs
            .map(nodeID => figma.getNodeById(nodeID))
            .filter(node => node !== null);

        const selectedNodes = figma.currentPage.selection;

        const nodesToSelect = shouldAppendInstead
            ? selectedNodes.concat(remainingNodesInSelection)
            : remainingNodesInSelection;

        if (nodesToSelect.length) {
            figma.currentPage.selection = nodesToSelect;
        } else {
            notify('Everything in this selection has since been deleted');
        }
    }

    if (msg.type === 'deleteSavedSelection') {
        const { selectionID } = msg.params;
        const { savedSelections } = pageState;

        await updatePageState({
            pathToValue: 'savedSelections',
            newValue: omit(savedSelections, selectionID),
        });

        await refreshUI();

        notify('💥 Deleted');
    }

    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
