import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { NavBar } from './components/Navigation';
import About from './components/About';
import FindAndReplace from './components/FindAndReplace';
import { GlobalStyles, StyledAppContainer } from './components/layout';
import LoadingScreen from './components/LoadingScreen';
import { sendMessage } from './components/utils';

/*
    pluginState = {
        // Globally in Figma
    };
 */

const INITIAL_STATE = {
    isCaseSensitive: false,
    isRegExp: false,
    needle: '',
    replacement: '',
};

const App = () => {
    const [activeRoute, setActiveRoute] = React.useState('findAndReplace');
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pluginState, setPluginState] = React.useState(null);

    React.useEffect(() => {
        if (isLoaded) return;

        onmessage = message => {
            const { savedPluginState } = message.data.pluginMessage;
            setPluginState(savedPluginState || INITIAL_STATE);
            setIsLoaded(true);
        };

        sendMessage({
            type: 'init',
        });
    }, [isLoaded]);

    React.useEffect(() => {
        if (isLoaded && pluginState) {
            sendMessage({
                type: 'savePluginState',
                pluginState,
            });
        }
    }, [isLoaded, pluginState]);

    const handleRouteButtonClick = routeName => {
        setActiveRoute(routeName);
    };

    return (
        <StyledAppContainer>
            <GlobalStyles />
            {!isLoaded ? (
                <LoadingScreen />
            ) : (
                <>
                    <NavBar
                        primaryRoutes={[
                            { name: 'findAndReplace', label: 'Search' },
                        ]}
                        secondaryRoutes={[{ name: 'about', label: 'About' }]}
                        activeRoute={activeRoute}
                        onRouteButtonClick={handleRouteButtonClick}
                    />
                    {activeRoute === 'findAndReplace' && (
                        <FindAndReplace
                            data={{ pluginState }}
                            actions={{ setPluginState }}
                        />
                    )}
                    {activeRoute === 'about' && <About />}
                </>
            )}
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
