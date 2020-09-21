import React from 'react';
import cn from 'classnames';
import uniq from 'lodash/uniq';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Collapse from '@material-ui/core/Collapse';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';

import { MenuContext } from '../providers/MenuProvider';
import { getI } from '../utils';
import { SelectedMenuItem } from './ItemsSubsetList';

export interface MenuSelectorItemData extends SelectedMenuItem {
    secondaryText?: string
    price?: number
    available?: boolean
    imageUrl?: string
}

type MenuFilter = {
    onlyAvailable: boolean
};

type SelectMenuItemDialogProps = {
    targetsId: string[]
    variant: 'items' | 'categories'
    open: boolean
    singleItem?: boolean
    selectedItems?: SelectedMenuItem[]
    onCloseDialog: (selection: SelectedMenuItem[]) => void
};

const targetAvatar: Record<string, string> = {
    'kumir': 'K',
};
const filterIconWidth = 60;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuDialog: {
            '&': {
                zIndex: '1501 !important',
            },
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
        root: {
            width: '100%',
            height: '100%',
        },
        rootRow: {
            width: '100%',
        },
        listRow: {
            flex: '1 1 auto',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(2),
        },
        row: {
            display: 'flex',
            alignItems: 'center',
        },
        searchField: {
            width: `calc(100% - ${filterIconWidth}px)`,
            margin: theme.spacing(1),
            '& .MuiInputBase-adornedStart': {
                paddingLeft: theme.spacing(1),
            },
            '& .MuiInputBase-adornedEnd': {
                paddingRight: theme.spacing(1),
            },
        },
        clearSearchButton: {
            '&:hover': {
                backgroundColor: 'transparent',
                color: '#000',
            },
        },
        filterContainer: {
            margin: `0 ${theme.spacing(2)}px`,
        },
        filterSwitch: {
            marginLeft: theme.spacing(2),
        },
        listItem: {
            margin: '4px 0',
        },
        listItemContent: {
            display: 'flex',
            flex: '1 1 auto',
            overflow: 'hidden',
            '&>div:first-child': {
                flexGrow: 1,
                overflow: 'hidden',
                '&>p': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                },
            },
            '&>div:last-child': {
                flexShrink: 0,
                width: 100,
            },
        },
        targetAvatar: {
            height: 28,
            width: 28,
        },
        targetAvatarUnavailable: {
            backgroundColor: '#a6a7a6 !important',
        },
        kumir: {
            backgroundColor: '#7bb21f',
            color: '#fff',
        },
        namnym: {
            backgroundColor: '#ffad01',
            color: '#fff',
        },
        unavailableChip: {
            display: 'inline-block',
            marginLeft: theme.spacing(2),
            height: 16,
        },
        listItemTextPrimaryUnavailable: {
            color: '#6d6d6d',
        },
        listItemTextSecondary: {
            display: 'inline-block',
            color: 'rgba(0,0,0,.54)',
        },
        listItemTextSecondaryUnavailable: {
            color: 'rgba(0,0,0,.32)',
        },
        listItemPrice: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
        },
        listItemPriceUnavailable: {
            color: '#6d6d6d',
        },
    }),
);

export const SelectMenuItemDialog: React.FC<SelectMenuItemDialogProps> = (props) => {
    const {
        targetsId,
        variant,
        open,
        singleItem = false,
        selectedItems,
        onCloseDialog,
    } = props;
    const classes = useStyles();
    const menuContext = React.useContext(MenuContext);
    const [localSelected, setLocalSelected] = React.useState<SelectedMenuItem[]>(selectedItems || []);
    const [searchString, setSearchString] = React.useState('');
    const [showFilterPanel, setShowFilterPanel] = React.useState(false);
    const [filter, setFilter] = React.useState<MenuFilter>({
        onlyAvailable: true,
    });

    const onChangeSearchString = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSearchString(e.target.value);
    }, []);

    const clearSearch = React.useCallback(() => {
        setSearchString('');
    }, []);

    const toggleFilterPanel = React.useCallback(() => {
        setShowFilterPanel(state => !state);
    }, []);

    const selectItem = React.useCallback((item: SelectedMenuItem) => {
        if (singleItem) {
            onCloseDialog([ item ]);
        }
        setLocalSelected(state => [ ...state, item ]);
    }, [singleItem, onCloseDialog]);

    const unselectItem = React.useCallback((item: SelectedMenuItem) => {
        setLocalSelected(state => {
            const delIndex = getI(state, item.id);
            return [
                ...state.slice(0, delIndex),
                ...state.slice(delIndex + 1, state.length),
            ];
        });
    }, []);

    const itemsPool = React.useMemo(() => {
        return Object.entries(menuContext).reduce<MenuSelectorItemData[]>((total, [target, targetMenu]) => {
            if (targetsId.includes(target)) {
                let targetItems = [];
                if (variant === 'items') {
                    targetItems = targetMenu.map<MenuSelectorItemData>(menuItem => ({
                        id: menuItem.id,
                        name: menuItem.name,
                        targetId: menuItem.targetId,
                        available: menuItem.enabled,
                        imageUrl: menuItem.imageUrl || undefined,
                        price: menuItem.price,
                        secondaryText: menuItem.category,
                    }));
                } else {
                    targetItems = uniq(targetMenu.map<string>(menuItem => menuItem.category))
                        .map<MenuSelectorItemData>(category => ({
                            id: `${target}_${category}`,
                            name: category,
                            targetId: target,
                        }));
                }
                total.push(...targetItems);
            }
            return total;
        }, []);
    }, [menuContext, variant, targetsId]);

    const filteredItems = React.useMemo(() => {
        return itemsPool.filter(item => {
            if (variant === 'categories') {
                return item.name.toLowerCase().includes(searchString.toLowerCase());
            } else {
                return (
                    item.name.toLowerCase().includes(searchString.toLowerCase()) ||
                    item.secondaryText!.toLowerCase().includes(searchString.toLowerCase())
                ) && (filter.onlyAvailable ? item.available! : true);
            }
        });
    }, [itemsPool, variant, searchString, filter]);

    const getItemKey = React.useCallback((i: number, data: MenuSelectorItemData[]) => {
        return data[i].id;
    }, []);

    const targetClasses = React.useMemo<Record<string, string>>(() => ({
        'kumir': classes.kumir,
        'namnym': classes.namnym,
    }), [classes.kumir, classes.namnym]);

    const renderListItem = React.useCallback((props: ListChildComponentProps) => {
        const item = props.data[props.index] as MenuSelectorItemData;
        const isSelected = localSelected && !!localSelected.find(sItem => sItem.id === item.id);
        const clickAction = isSelected ? unselectItem : selectItem;
        return (
            <ListItem
                key={item.id}
                button
                divider
                style={props.style}
                className={classes.listItem}
                selected={isSelected}
                onClick={() => clickAction({ id: item.id, name: item.name, targetId: item.targetId })}
            >
                <ListItemAvatar>
                    <Avatar
                        className={cn(
                            classes.targetAvatar,
                            targetClasses[item.targetId],
                            {
                                [classes.targetAvatarUnavailable]: item.available === false,
                            },
                        )}
                    >
                        {targetAvatar[item.targetId]}
                    </Avatar>
                </ListItemAvatar>
                <div className={classes.listItemContent}>
                    <div>
                        <Typography className={cn({
                            [classes.listItemTextPrimaryUnavailable]: item.available === false,
                        })}>
                            {item.name}
                        </Typography>
                        { variant === 'items' && (
                            <div>
                                <Typography
                                    variant="body2"
                                    className={cn(
                                        classes.listItemTextSecondary,
                                        { [classes.listItemTextSecondaryUnavailable]: item.available === false },
                                    )}
                                >
                                    {item.secondaryText!}
                                </Typography>
                                {item.available === false && (
                                    <Chip
                                        color="secondary"
                                        label="unavailable"
                                        className={classes.unavailableChip}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    { variant === 'items' && (
                        <div
                            className={cn(
                                classes.listItemPrice,
                                { [classes.listItemPriceUnavailable]: item.available === false },
                            )}
                        >
                            {`${item.price} руб`}
                        </div>
                    )}
                </div>
            </ListItem>
        );
    }, [
        localSelected,
        targetClasses,
        variant,
        selectItem,
        unselectItem,
        classes.listItem,
        classes.targetAvatar,
        classes.targetAvatarUnavailable,
        classes.listItemContent,
        classes.listItemTextPrimaryUnavailable,
        classes.listItemTextSecondary,
        classes.listItemTextSecondaryUnavailable,
        classes.listItemPrice,
        classes.listItemPriceUnavailable,
        classes.unavailableChip,
    ]);

    return (
        <Dialog
            open={open}
            onClose={onCloseDialog}
            disableBackdropClick
            className={classes.menuDialog}
        >
            <DialogTitle disableTypography className={classes.dialogTitle}>
                <Typography className={classes.dialogTitleText}>
                    { variant === 'items' ? 'Select menu item' : 'Select menu category'}
                </Typography>
                <IconButton
                    aria-label="Close"
                    className={classes.closeDialogButton}
                    onClick={() => onCloseDialog(localSelected)}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <Grid container className={classes.root} direction="column">
                    <Grid item className={classes.rootRow}>
                        {!!localSelected.length && (
                            <div />
                        )}
                    </Grid>
                    <Grid item className={classes.rootRow}>
                        <div className={classes.row}>
                            <TextField
                                placeholder="Search"
                                variant="outlined"
                                className={classes.searchField}
                                value={searchString}
                                onChange={onChangeSearchString}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Tooltip title="Search" aria-label="Search">
                                                <IconButton>
                                                    <SearchIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (searchString && (
                                        <InputAdornment position="end">
                                            <Tooltip title="Clear search" aria-label="Clear search">
                                                <IconButton
                                                    size="small"
                                                    disableFocusRipple
                                                    disableTouchRipple
                                                    disableRipple
                                                    className={classes.clearSearchButton}
                                                    onClick={clearSearch}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    )),
                                }}
                            />
                            { variant === 'items' && (
                                <Tooltip
                                    title={showFilterPanel ? 'Show filter panel' : 'Hide filter panel'}
                                    aria-label={showFilterPanel ? 'Show filter panel' : 'Hide filter panel'}
                                >
                                    <IconButton
                                        onClick={toggleFilterPanel}
                                        color={showFilterPanel ? 'primary' : 'default'}
                                    >
                                        <FilterListRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </div>
                        { variant === 'items' && (
                            <Collapse in={showFilterPanel}>
                                <Grid container className={classes.filterContainer}>
                                    <Grid item>
                                        <FormControlLabel
                                            label="Show only available"
                                            labelPlacement="start"
                                            control={
                                                <Switch
                                                    color="primary"
                                                    name="filterOnlyAvailableSwitch"
                                                    className={classes.filterSwitch}
                                                    checked={filter.onlyAvailable}
                                                    onChange={() => setFilter({ ...filter, onlyAvailable: !filter.onlyAvailable })}
                                                />
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Collapse>
                        )}
                    </Grid>
                    <Grid item className={cn(classes.rootRow, classes.listRow)}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <FixedSizeList
                                    height={height}
                                    width={width}
                                    itemCount={filteredItems.length}
                                    itemSize={48}
                                    itemData={filteredItems}
                                    itemKey={getItemKey}
                                >
                                    {renderListItem}
                                </FixedSizeList>
                            )}
                        </AutoSizer>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};
