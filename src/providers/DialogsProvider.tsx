import React from 'react';
import { ListDialog, ListDialogProps, ItemBase } from '../components/list/ListDialog';

type DialogsContextValue = {
    setupDialog: <Item extends ItemBase>(props: ListDialogProps<Item>) => void
    closeDialog: () => void
};

export const DialogsContext = React.createContext<DialogsContextValue>({ setupDialog: () => {}, closeDialog: () => {} });

export const DialogsProvider: React.FC = React.memo(({ children }) => {

    const [open, setOpen] = React.useState(false);
    const [dialogProps, setDialogProps] = React.useState<ListDialogProps<ItemBase> | null>(null);

    const dialogsContextValue = React.useMemo<DialogsContextValue>(() => ({
        setupDialog: <Item extends ItemBase>(props: ListDialogProps<Item>) => {
            setOpen(true);
            // @ts-ignore
            setDialogProps(props);
        },
        closeDialog: () => setOpen(false),
    }), []);

    console.log('@dialogsProps: ', dialogProps);

    return (
        <DialogsContext.Provider value={ dialogsContextValue }>
            { children }
            { !!dialogProps && open && (
                <ListDialog {...dialogProps} />
            )}
        </DialogsContext.Provider>
    );
});
