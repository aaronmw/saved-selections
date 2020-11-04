import * as React from 'react';
import get from 'lodash/get';
import { Button, Input, ToggleButton } from './controls';
import { COLOR_TEXT_LIGHT, FlexBox, Row } from './layout';
import { sendMessage } from './utils';

const FindAndReplace = ({ data, actions }) => {
    const { pluginState } = data;
    const { setPluginState } = actions;
    const [isCaseSensitive, setIsCaseSensitive] = React.useState(
        get(pluginState, 'isCaseSensitive', false),
    );
    const [isRegExp, setIsRegExp] = React.useState(
        get(pluginState, 'isRegExp', false),
    );
    const [needle, setNeedle] = React.useState(get(pluginState, 'needle', ''));
    const [replacement, setReplacement] = React.useState(
        get(pluginState, 'replacement', ''),
    );

    React.useEffect(() => {
        sendMessage({
            type: 'setWindowHeight',
            params: {
                height: 223,
            },
        });
    }, []);

    React.useEffect(() => {
        setPluginState({ isCaseSensitive, isRegExp, needle, replacement });
    }, [isCaseSensitive, isRegExp, needle, replacement]);

    const handleClickReplaceAll = () => {
        sendMessage({
            type: 'findAndReplace',
            params: { isCaseSensitive, isRegExp, needle, replacement },
        });
    };

    const handleChangeNeedle = evt => setNeedle(evt.target.value);
    const handleChangeReplacement = evt => setReplacement(evt.target.value);
    const handleClickToggleIsRegExp = () => setIsRegExp(!isRegExp);
    const handleClickToggleIsCaseSensitive = () =>
        setIsCaseSensitive(!isCaseSensitive);

    return (
        <div
            style={{
                padding: '15px',
            }}
        >
            <Row>
                <FlexBox isFullWidth>
                    <div>Find:</div>
                    <FlexBox>
                        <ToggleButton
                            isActive={isCaseSensitive}
                            title="Case Sensitive"
                            onClick={handleClickToggleIsCaseSensitive}
                        >
                            Aa
                        </ToggleButton>
                        <ToggleButton
                            isActive={isRegExp}
                            title="Regular Expression"
                            onClick={handleClickToggleIsRegExp}
                        >
                            <span
                                style={{
                                    bottom: '1px',
                                    fontSize: '1.4rem',
                                    position: 'relative',
                                }}
                            >
                                .
                            </span>
                            <span
                                style={{
                                    fontSize: '1.4rem',
                                    position: 'relative',
                                    top: '1px',
                                }}
                            >
                                *
                            </span>
                        </ToggleButton>
                    </FlexBox>
                </FlexBox>
                <Input
                    style={{
                        fontFamily: isRegExp ? 'monospace' : 'inherit',
                    }}
                    type="text"
                    value={needle}
                    onChange={handleChangeNeedle}
                />
            </Row>
            <Row>
                <div>Replace With:</div>
                <Input
                    type="text"
                    value={replacement}
                    onChange={handleChangeReplacement}
                />
                <div
                    style={{
                        color: COLOR_TEXT_LIGHT,
                        visibility: isRegExp ? 'visible' : 'hidden',
                    }}
                >
                    <code>
                        $<em>n</em>
                    </code>{' '}
                    refers the <em>n</em>th bracketed submatch
                </div>
            </Row>
            <Row>
                <Button onClick={handleClickReplaceAll}>Replace All</Button>
            </Row>
        </div>
    );
};

export default FindAndReplace;
