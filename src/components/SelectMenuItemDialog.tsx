import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { MenuContext } from '../providers/MenuProvider';
import { MenuItemSelector } from './MenuItemSelector';
import { AnyMenuItem } from '../../types/autoOrderMenus';

type SelectMenuItemDialogProps = {
    targetId: string[]
    open: boolean
    onCloseDialog: () => void
    selectTargetMenuItem: (targetId: string, menuItemId: string) => void
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuDialog: {
            '& .MuiDialog-paperWidthSm': {
                height: '80%',
                maxWidth: 800,
                width: 800,
                [theme.breakpoints.down('sm')]: {
                    margin: 0,
                },
            },
        },
        dialogTitle: {
            margin: 0,
            marginLeft: theme.spacing(2),
            padding: theme.spacing(2),
        },
        dialogTitleText: {
            fontSize: '1.3rem',
        },
        closeDialogButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
        dialogContent: {
            [theme.breakpoints.down('xs')]: {
                padding: 0,
            },
        },
    }),
);

export const SelectMenuItemDialog: React.FC<SelectMenuItemDialogProps> = (props) => {
    const { targetId, open, onCloseDialog, selectTargetMenuItem } = props;
    const classes = useStyles();
    const menuContext = React.useContext(MenuContext);
    const menuItems = React.useMemo(() => {
        return Object.entries(menuContext).reduce<AnyMenuItem[]>((total, [target, targetMenu]) => {
            if (targetId.includes(target)) {
                total.push(...targetMenu);
            }
            return total;
        }, []);
    }, [menuContext, targetId]);

    return (
        <Dialog
            open={open}
            onClose={onCloseDialog}
            disableBackdropClick
            className={classes.menuDialog}
        >
            <DialogTitle disableTypography className={classes.dialogTitle}>
                <Typography className={classes.dialogTitleText}>
                    Select menu item
                </Typography>
                <IconButton
                    aria-label="Close"
                    className={classes.closeDialogButton}
                    onClick={onCloseDialog}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <MenuItemSelector
                    items={menuItems}
                    selectItem={selectTargetMenuItem}
                />
            </DialogContent>
        </Dialog>
    );
};
