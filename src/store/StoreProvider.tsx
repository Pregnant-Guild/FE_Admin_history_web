'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useRestoreUserData } from '@/hooks/useRestoreUserData';


function RestoreUserDataComponent() {
    useRestoreUserData();
    return null;
}

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeRef = useRef(store);
    return (
        <Provider store={storeRef.current}>
            <RestoreUserDataComponent />
            {children}
        </Provider>
    );
}