import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
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

import { MenuItem } from '../../types/autoOrderMenus';

type Props = {
    items: MenuItem[]
    selectItem: (itemId: string) => void
    selectedItems?: MenuItem[]
};

type MenuFilter = {
    onlyAvailable: boolean
};

const filterIconWidth = 60;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
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
        return items.filter(item => item.name.includes(searchString));
    }, [items, searchString]);

    return (
        <Grid container className={classes.root}>
            <Grid item className={classes.root}>
                {selectedItems && (
                    <div />
                )}
            </Grid>
            <Grid item className={classes.root}>
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
            <Grid item className={classes.root}>

            </Grid>
        </Grid>
    );
};
