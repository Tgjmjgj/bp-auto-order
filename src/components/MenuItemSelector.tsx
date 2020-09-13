import React from 'react';
import cn from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Collapse from '@material-ui/core/Collapse';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar'; 
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';

import { TargetMenuItem } from '../../types/autoOrderMenus';

type Props = {
    items: TargetMenuItem[]
    selectItem: (itemId: string) => void
    selectedItems?: string[]
};

type MenuFilter = {
    onlyAvailable: boolean
};

const targetAvatar: Record<string, string> = {
    'kumir': 'K',
};

const filterIconWidth = 60;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
        listItemUnavailable: {
            // backgroundColor: '#ffeaea',
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

export const MenuItemSelector: React.FC<Props> = (props) => {
    const { items, selectItem, selectedItems } = props;
    const classes = useStyles();
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

    const filteredItems = React.useMemo(() => {
        return items.filter(item => {
            return item.name.toLowerCase().includes(searchString.toLowerCase()) &&
                (filter.onlyAvailable ? item.enabled : true);
        });
    }, [items, searchString, filter]);

    const getItemKey = React.useCallback((i: number, data: TargetMenuItem[]) => {
        return data[i].id;
    }, []);

    const renderListItem = React.useCallback((props: ListChildComponentProps) => {
        const item = props.data[props.index] as TargetMenuItem;
        return (
            <ListItem
                key={item.id}
                button
                divider
                style={props.style}
                className={cn(
                    classes.listItem,
                    { [classes.listItemUnavailable]: !item.enabled },
                )}
                selected={selectedItems && selectedItems.includes(item.id)}
                onClick={() => selectItem(item.id)}
            >
                <ListItemAvatar>
                    <Avatar
                        className={cn(
                            classes.targetAvatar, {
                                [classes.kumir]: item.target === 'kumir',
                                [classes.targetAvatarUnavailable]: !item.enabled,
                            },
                        )}
                    >
                        {targetAvatar[item.target]}
                    </Avatar>
                </ListItemAvatar>
                <div className={classes.listItemContent}>
                    <div>
                        <Typography className={cn({
                            [classes.listItemTextPrimaryUnavailable]: !item.enabled,
                        })}>
                            {item.name}
                        </Typography>
                        <div>
                            <Typography
                                variant="body2"
                                className={cn(
                                    classes.listItemTextSecondary,
                                    { [classes.listItemTextSecondaryUnavailable]: !item.enabled },
                                )}
                            >
                                {item.category}
                            </Typography>
                            {!item.enabled && (
                                <Chip
                                    color="secondary"
                                    label="unavailable"
                                    className={classes.unavailableChip}
                                />
                            )}
                        </div>
                    </div>
                    <Divider orientation="vertical" />
                    <div
                        className={cn(
                            classes.listItemPrice,
                            { [classes.listItemPriceUnavailable]: !item.enabled },
                        )}
                    >
                        {`${item.price} руб`}
                    </div>
                </div>
            </ListItem>
        );
    }, [
        selectedItems,
        selectItem,
        classes.listItem,
        classes.listItemUnavailable,
        classes.kumir,
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
        <Grid container className={classes.root} direction="column">
            <Grid item className={classes.rootRow}>
                {selectedItems && (
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
                </div>
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
    );
};
