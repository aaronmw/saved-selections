import * as React from 'react';
import styled from 'styled-components';

const LoadingScreen = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: radial-gradient(white, hsl(0, 0%, 95%));
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:before {
        content: 'Loading...';
        display: inline;
    }
`;

export default LoadingScreen;
