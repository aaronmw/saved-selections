import * as React from 'react';
import * as ReactDOM from 'react-dom';
import clone from 'lodash/clone';
import setWith from 'lodash/setWith';
import { Columns, GlobalStyles, StyledAppContainer } from './components/layout';
import { Button, Label } from './components/controls';

const sendMessage = payload => {
    parent.postMessage(
        {
            pluginMessage: {
                ...JSON.parse(JSON.stringify(payload)),
            },
        },
        '*',
    );
};

const INITIAL_STATE = {
    sortOrder: 'asc',
};

const App = () => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pluginState, setPluginState] = React.useState(INITIAL_STATE);

    onmessage = message => {
        const savedState = message.data.pluginMessage;

        setPluginState({
            ...INITIAL_STATE,
            ...savedState,
        });

        if (!isLoaded) {
            setIsLoaded(true);
        }
    };

    React.useEffect(() => {
        sendMessage({
            type: 'init',
            initialState: INITIAL_STATE,
        });
    }, []);

    React.useEffect(() => {
        sendMessage({
            type: 'saveState',
            params: pluginState,
        });
    }, [pluginState]);

    const handleSubmit = evt => {
        evt.preventDefault();
        sendMessage({
            type: 'run',
            params: pluginState,
        });
    };

    const handleKeyDown = evt => {
        if (evt.key === 'Escape') {
            sendMessage({ type: 'close' });
        }
    };

    const updateState = ({ path, newValue }) => {
        setPluginState(pluginState =>
            setWith(clone(pluginState), path, newValue, clone),
        );
    };

    const handleChange = evt => {
        updateState({
            path: ['sortOrder'],
            newValue: evt.target.value,
        });
    };

    const { sortOrder } = pluginState;

    return (
        <StyledAppContainer onKeyDown={handleKeyDown}>
            <GlobalStyles />
            <form onSubmit={handleSubmit}>
                <Columns>
                    <Label>
                        <input
                            type="radio"
                            name="sort-order"
                            checked={sortOrder === 'asc'}
                            value="asc"
                            onChange={handleChange}
                        />{' '}
                        A &ndash; Z
                    </Label>
                    <Label>
                        <input
                            type="radio"
                            name="sort-order"
                            checked={sortOrder === 'desc'}
                            value="desc"
                            onChange={handleChange}
                        />{' '}
                        Z &ndash; A
                    </Label>
                </Columns>
                <Button type="submit">Sort</Button>
            </form>
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
