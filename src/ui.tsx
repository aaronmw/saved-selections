import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { NavBar } from './components/Navigation';
import About from './components/About';
import SavedSelectionList from './components/SavedSelectionList';
import { GlobalStyles, StyledAppContainer } from './components/layout';

/*
    pluginState = {
        // Globally in Figma
    };

    pageState = {
        savedSelections: {
            [selectionID]: {
                nodeIDs: ['a', 'b', 'c'],
                label: 'My Saved Selection',
            }
        }
    }
 */

const App = () => {
    const [activeRoute, setActiveRoute] = React.useState('savedSelectionList');
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [pluginState, setPluginState] = React.useState({});
    const [pageState, setPageState] = React.useState({});

    const handleRouteButtonClick = routeName => {
        setActiveRoute(routeName);
    };

    return (
        <StyledAppContainer>
            <GlobalStyles />
            <NavBar
                activeRoute={activeRoute}
                onRouteButtonClick={handleRouteButtonClick}
            />
            {activeRoute === 'savedSelectionList' && (
                <SavedSelectionList
                    data={{ isLoaded, pluginState, pageState }}
                    actions={{ setIsLoaded, setPluginState, setPageState }}
                />
            )}
            {activeRoute === 'about' && <About />}
        </StyledAppContainer>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'));
