import React from 'react';
import { SelectMenuItemDialog } from '../components/SelectMenuItemDialog';

const dialogs = {
    'selectMenuItem': SelectMenuItemDialog,
} as const;

type DialogsContextValue = {
    setupDialog: <T extends keyof typeof dialogs>(type: T | null, props: React.ComponentProps<typeof dialogs[T]> | null) => void
};

export const DialogsContext = React.createContext<DialogsContextValue>({ setupDialog: () => {} });

export const DialogsProvider: React.FC = ({ children }) => {

    const [selectedDialog, setSelectedDialog] = React.useState<React.FC<any> | null>(null);

    const dialogsContextValue = React.useMemo<DialogsContextValue>(() => ({
        setupDialog: (type, props) => {
            setSelectedDialog(() => type ? React.createElement(dialogs[type], props) : null);
        },
    }), []);


    return (
        <DialogsContext.Provider value={ dialogsContextValue }>
            { children }
            { selectedDialog }
        </DialogsContext.Provider>
    );
};
