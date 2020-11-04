import * as React from 'react';
import styled from 'styled-components';
import {
    COLOR_BORDER,
    COLOR_TEXT,
    COLOR_TEXT_LIGHT,
    FlexBox,
    FONT_WEIGHT_BOLD,
} from './layout';

const NAVBAR_HEIGHT = '30px';

const StyledNavBar = styled.div`
    background-color: white;
    height: ${NAVBAR_HEIGHT};
`;

const StyledNavBarContents = styled.div`
    border-bottom: 1px solid ${COLOR_BORDER};
    padding: 0 15px;
    height: ${NAVBAR_HEIGHT};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
`;

const NavButton = styled.button`
    ${props => `
        font-weight: ${FONT_WEIGHT_BOLD};
        color: ${props.isActive ? COLOR_TEXT : COLOR_TEXT_LIGHT};
        cursor: ${props.isActive ? 'default' : 'pointer'};
    `}
`;

export const NavBar = ({
    activeRoute,
    primaryRoutes,
    secondaryRoutes,
    onRouteButtonClick,
}) => {
    const printRoutes = routes =>
        routes.map(({ name, label }) => (
            <NavButton
                key={name}
                isActive={activeRoute === name}
                onClick={onRouteButtonClick.bind(this, name)}
            >
                {label}
            </NavButton>
        ));

    return (
        <StyledNavBar>
            <StyledNavBarContents>
                <FlexBox isFullWidth justify="space-between">
                    <FlexBox justify="flex-start">
                        {printRoutes(primaryRoutes)}
                    </FlexBox>
                    <FlexBox justify="flex-end">
                        {printRoutes(secondaryRoutes)}
                    </FlexBox>
                </FlexBox>
            </StyledNavBarContents>
        </StyledNavBar>
    );
};

export const Route = styled.div`
    background-color: white;
    padding: 15px;
    position: fixed;
    top: ${NAVBAR_HEIGHT};
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
`;
