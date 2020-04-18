import * as React from 'react';
import styled from 'styled-components';
import get from 'lodash/get';
import { Icon, IconButton, Input, RunButton } from './controls';
import {
    COLOR_BORDER,
    COLOR_HOVER_BG,
    COLOR_TEXT_LIGHT,
    Columns,
    Row,
} from './layout';
import { sendMessage } from './utils';

const SavedSelection = styled(Columns)`
    position: relative;
    background-color: white;
    padding: 7px 15px;
    border-bottom: 1px solid ${COLOR_BORDER};
    cursor: pointer;

    &:hover,
    &.is-active {
        background-color: ${COLOR_HOVER_BG};
    }
    .showOnHover {
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
    }
    &:hover .showOnHover {
        opacity: 1;
        transition-delay: 0.5s;
    }
`;

const ButtonBar = styled(Columns)`
    position: absolute;
    right: 15px;
`;

const EmptyMessage = styled(Columns).attrs({
    align: 'center',
})`
    padding: 15px;
    color: ${COLOR_TEXT_LIGHT};
`;

const SavedSelectionList = ({ data, actions }) => {
    const { isLoaded, pluginState, pageState } = data;
    const { setIsLoaded, setPluginState, setPageState } = actions;
    const [editingSelectionID, setEditingSelectionID] = React.useState('');
    const [tempLabel, setTempLabel] = React.useState('Untitled');
    const savedSelections = get(pageState, 'savedSelections', {});

    React.useEffect(() => {
        onmessage = message => {
            const {
                savedPluginState,
                savedPageState,
            } = message.data.pluginMessage;

            setPluginState(savedPluginState);

            setPageState(savedPageState);

            if (!isLoaded) {
                setIsLoaded(true);
            }
        };

        sendMessage({
            type: 'setWindowHeight',
            params: {
                height: 250,
            },
        });

        sendMessage({
            type: 'init',
        });
    }, []);

    React.useEffect(() => {
        const labelInput = document.getElementById('savedSelectionLabelInput');
        if (labelInput) {
            labelInput.focus();
            (labelInput as any).select();
        }
    }, [editingSelectionID]);

    const saveSelection = () => {
        const newSelectionID = `${Date.now()}`;

        sendMessage({
            type: 'saveSelection',
            params: { newSelectionID },
        });

        setEditingSelectionID(newSelectionID);
    };

    const restoreSelection = (selectionID, evt) => {
        sendMessage({
            type: 'restoreSelection',
            params: { selectionID, shouldAppendInstead: evt.shiftKey },
        });

        window.parent.focus();
    };

    const handleClickEdit = (selectionID, evt) => {
        evt.stopPropagation();
        setEditingSelectionID(selectionID);
        setTempLabel(savedSelections[selectionID].label);
    };

    const handleLabelInputChange = evt => {
        setTempLabel(evt.target.value);
    };

    const handleClickSave = (selectionID, evt) => {
        evt.stopPropagation();

        if (tempLabel.trim() === '') {
            return false;
        }

        sendMessage({
            type: 'relabelSavedSelection',
            params: { selectionID, newValue: tempLabel },
        });

        setEditingSelectionID('');
    };

    const handleLabelInputKeyDown = (selectionID, evt) => {
        switch (evt.key) {
            case 'Enter':
                handleClickSave(selectionID, evt);
                break;
            case 'Escape':
                setEditingSelectionID('');
                break;
        }
    };

    const handleClickSync = (selectionID, evt) => {
        evt.stopPropagation();

        sendMessage({
            type: 'saveSelection',
            params: { selectionID },
        });
    };

    const handleClickDelete = (selectionID, evt) => {
        evt.stopPropagation();

        sendMessage({
            type: 'deleteSavedSelection',
            params: { selectionID },
        });
    };

    const savedSelectionIDs = Object.keys(savedSelections);

    return (
        <>
            {savedSelectionIDs.length === 0 && (
                <EmptyMessage>Select some stuff...</EmptyMessage>
            )}
            {savedSelectionIDs.map(selectionID => {
                const { label } = savedSelections[selectionID];
                const isEditing = editingSelectionID === selectionID;
                const isEditingAnything = editingSelectionID !== '';

                return (
                    <SavedSelection
                        key={selectionID}
                        align="space-between"
                        className={isEditing && 'is-active'}
                        onClick={restoreSelection.bind(this, selectionID)}
                    >
                        <Columns align="flex-start">
                            <Icon name="floppy-disc" />
                            {isEditing ? (
                                <Input
                                    id="savedSelectionLabelInput"
                                    value={tempLabel}
                                    onClick={evt => evt.stopPropagation()}
                                    onKeyDown={handleLabelInputKeyDown.bind(
                                        this,
                                        selectionID,
                                    )}
                                    onChange={handleLabelInputChange}
                                    maxLength={32}
                                />
                            ) : (
                                <span>{label}</span>
                            )}
                        </Columns>
                        {!isEditingAnything && (
                            <ButtonBar spacing="none" className="showOnHover">
                                <IconButton
                                    iconName="times"
                                    onClick={handleClickDelete.bind(
                                        this,
                                        selectionID,
                                    )}
                                />
                                <IconButton
                                    iconName="sync"
                                    onClick={handleClickSync.bind(
                                        this,
                                        selectionID,
                                    )}
                                />
                                <IconButton
                                    iconName="pencil"
                                    onClick={handleClickEdit.bind(
                                        this,
                                        selectionID,
                                    )}
                                />
                            </ButtonBar>
                        )}
                        {isEditing && (
                            <IconButton
                                iconName="check"
                                onClick={handleClickSave.bind(
                                    this,
                                    selectionID,
                                )}
                            />
                        )}
                    </SavedSelection>
                );
            })}
            <Row>
                <RunButton onClick={saveSelection}>
                    <Icon color="white" name="floppy-disc" />
                    Save Selection
                </RunButton>
            </Row>
        </>
    );
};

export default SavedSelectionList;
