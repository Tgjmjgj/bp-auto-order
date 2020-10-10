import React from 'react';
import cn from 'classnames';
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
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';

export type ListDialogFilter = {
    search: string
    switches: {
        [switchKey: string]: {
            label: string
            value: boolean
        }
    }
};

export type ItemBase = {
    id: string
}

export type ListDialogProps<Item extends ItemBase> = {
    filter: ListDialogFilter
    title: string
    renderItem: (item: Item, searchText: string) => JSX.Element
    filterItems: (filter: ListDialogFilter) => Item[]
    onCloseDialog: () => void
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
    }),
);

export function ListDialog<Item extends ItemBase>(props: ListDialogProps<Item>) {
    const {
        title,
        filter: filterInitValue,
        renderItem,
        filterItems,
        onCloseDialog,
    } = props;
    const classes = useStyles();
    const [showFilterPanel, setShowFilterPanel] = React.useState(false);
    const [filter, setFilter] = React.useState(filterInitValue);

    const onChangeSearchString = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const search = e.target.value;
        setFilter(filter => ({ ...filter, search }));
    }, []);

    const clearSearch = React.useCallback(() => {
        setFilter(filter => ({ ...filter, search: '' }));
    }, []);

    const toggleFilterPanel = React.useCallback(() => {
        setShowFilterPanel(state => !state);
    }, []);

    const getItemKey = React.useCallback((i: number, data: Item[]) => {
        return data[i].id;
    }, []);

    const renderListItem = React.useCallback((props: ListChildComponentProps) => {
        const item = props.data[props.index] as Item;
        return (
            <div style={props.style}>
                { renderItem(item, filter.search) }
            </div>
        );
    }, [renderItem, filter.search]);

    const filteredItems = React.useMemo(() => {
        return filterItems(filter);
    }, [filterItems, filter]);

    const toggleFilterSwitch = React.useCallback((switchName: string) => {
        setFilter(filter => ({
            ...filter,
            switches: {
                ...filter.switches,
                [switchName]: {
                    label: filter.switches[switchName].label,
                    value: !filter.switches[switchName].value,
                },
            },
        }));
    }, []);

    console.log('items: ', filteredItems);

    const filterSwitchesUI = React.useMemo(() => {
        return Object.entries(filter.switches).map(([switcher, value]) => {
            return (
                <Grid item key={switcher}>
                    <FormControlLabel
                        label={value.label}
                        labelPlacement="start"
                        control={
                            <Switch
                                color="primary"
                                name={switcher}
                                className={classes.filterSwitch}
                                checked={value.value}
                                onChange={() => toggleFilterSwitch(switcher)}
                            />
                        }
                    />
                </Grid>
            );
        });
    }, [filter, toggleFilterSwitch, classes.filterSwitch]);

    return (
        <Dialog
            open={true}
            onClose={onCloseDialog}
            disableBackdropClick
            className={classes.menuDialog}
        >
            <DialogTitle disableTypography className={classes.dialogTitle}>
                <Typography className={classes.dialogTitleText}>
                    {title}
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
                <Grid container className={classes.root} direction="column">
                    <Grid item className={classes.rootRow}>
                    </Grid>
                    <Grid item className={classes.rootRow}>
                        <div className={classes.row}>
                            <TextField
                                placeholder="Search"
                                variant="outlined"
                                className={classes.searchField}
                                value={filter.search}
                                onChange={onChangeSearchString}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Tooltip arrow title="Search" aria-label="Search">
                                                <IconButton>
                                                    <SearchIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (filter.search && (
                                        <InputAdornment position="end">
                                            <Tooltip arrow title="Clear search" aria-label="Clear search">
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
                            { !!filterSwitchesUI.length && (
                                <Tooltip
                                    arrow
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
                        { !!filterSwitchesUI.length && (
                            <Collapse in={showFilterPanel}>
                                <Grid container className={classes.filterContainer}>
                                    { filterSwitchesUI }
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
