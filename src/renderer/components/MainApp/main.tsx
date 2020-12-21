import { ipcRenderer } from 'electron';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { TwitchStore } from '../../stores/tc_store';
import { ThemeStore } from '../../stores/theme_store';
import { UserInfo, UserInfoStore } from '../../stores/user_info_store';

import Login from '../Login/login';
import { EnterUser } from '../EnterUsername/enter_user';
import { Followers } from '../Followed/followers';
import { ChannelTabs } from '../ChannelTabs/channel_tabs';
import { Chat } from '../Chat/chat';

import './main.scss';
import { StreamStore } from '../../stores/streams_store';
import { checkKeybind } from '../../util';

type TokenPayload = {
    token?: string;
};

type Props = {
    themeStore: ThemeStore;
    tc: TwitchStore;
    userInfo: UserInfoStore;
    streamStore: StreamStore;
};
export const Main = observer(({ themeStore, tc, userInfo, streamStore }: Props) => {
    const { themeData } = themeStore;
    const { token, username } = userInfo;

    const [keys, setKeys] = useState<string[]>([]);

    const handleCloseEvt = (e: KeyboardEvent) =>
        setKeys(p => {
            return [...p, e.key];
        });

    useEffect(() => {
        if (username && token) {
            const info: UserInfo = { username, token };
            streamStore.init(info);
            tc.connect(info);
        }
    }, [username, token]);

    useEffect(() => {
        ipcRenderer.on('get-auth', (msg: any) => {
            console.log(msg);
        });
        ipcRenderer.on('token', (evt, arg: TokenPayload) => {
            if (arg.token) {
                userInfo.setToken(arg.token);
            }
        });
        return function() {
            console.log('closing...');
            tc.client?.disconnect();
        };
    }, []);
    useEffect(() => {
        document.addEventListener('keydown', handleCloseEvt);

        return function() {
            document.removeEventListener('keydown', handleCloseEvt);
        };
    }, []);

    useEffect(() => {
        if (keys.length > 2) {
            const copy = [...keys];
            copy.splice(0, 1);
            setKeys(copy);
            return;
        }
        const shouldClose = checkKeybind(keys);
        if (shouldClose && tc.selected) {
            tc.partChannel(tc.selected);
            setKeys([]);
        }
    }, [keys, tc.selected]);
    return (
        <div
            className="container"
            style={{ backgroundColor: themeData.backgroundColor, color: themeData.color }}
        >
            {!token && <Login />}
            {token && !username && <EnterUser theme={themeStore} userInfo={userInfo} />}
            {token && username && (
                <div className="main-app">
                    <Followers streamStore={streamStore} themeStore={themeStore} tc={tc} />
                    <div className="inner-app">
                        <ChannelTabs tc={tc} theme={themeData} />
                        <Chat tc={tc} />
                    </div>
                </div>
            )}
        </div>
    );
});
