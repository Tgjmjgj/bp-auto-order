import React from 'react';
import cn from 'classnames';
import words from 'lodash/words';
import { DateTime } from 'luxon';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { DatePicker } from '@material-ui/pickers';

import { ConfigStateContext } from '../providers/ConfigStateProvider';
import { AutoAuthContext } from '../providers/AutoAuthProvider';
import { DateForContext, customDateFormat } from '../providers/DateForProvider';
import { MenuContext } from '../providers/MenuProvider';

type Props = {
    toggleMenu: () => void
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: {
            justifyContent: 'space-between',
        },
        header: {
            height: '60px',
            backgroundColor: '#FB5E5E',
            zIndex: 1505,
        },
        enabled: {
            backgroundColor: '#009FFF',
        },
        menuButton: {
            left: 0,
            marginLeft: theme.spacing(1),
            position: 'absolute',
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
        datepickerInput: {
            padding: '8px 12px',
        },
        stickyLeft: {
            marginLeft: theme.spacing(6),
        },
        stickyRight: {
            marginRight: theme.spacing(2),
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            color: 'rgba(0,0,0,0.87)',
        },
        userAvatar: {
            marginLeft: theme.spacing(2),
            backgroundColor: '#673ab7',
            height: theme.spacing(4),
            width: theme.spacing(4),
        },
        logoutButton: {
            marginLeft: theme.spacing(2),
        },
    }),
);

export const Header: React.FC<Props> = props => {

    const { toggleMenu } = props;
    const classes = useStyles();
    const configState = React.useContext(ConfigStateContext);
    const authState = React.useContext(AutoAuthContext);
    const menuState = React.useContext(MenuContext);
    const { dateFor, setDateFor } = React.useContext(DateForContext);
    const [date, setDate] = React.useState<DateTime | null>(DateTime.fromFormat(dateFor, customDateFormat));
    const enabled = configState.state.enabled;

    const nameLetters = React.useMemo(() => {
        if (!authState.displayName) {
            return ':D';
        }
        return words(authState.displayName.toUpperCase())
        .map(word => word.length ? word[0] : '')
        .join('');
    }, [authState.displayName]);

    const isAllMenuLoaded = React.useMemo(() => {
        return Object.values(menuState).every(menuData => menuData.loadStatus !== 'not-loaded');
    }, [menuState]);

    React.useEffect(() => {
        if (!date) {
            return;
        }
        setDateFor(date.toFormat(customDateFormat));
    }, [date, setDateFor]);

    console.log('@ ------ selected date: ', date && date.toISODate());

    const logout = React.useCallback(() => authState.logout(), [authState]);

    return (
        <AppBar position="sticky" className={cn(classes.header, { [classes.enabled]: enabled })}>
            <Toolbar className={classes.toolbar}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={toggleMenu}
                    className={classes.menuButton}
                >
                    <MenuIcon />
                </IconButton>
                <div className={classes.stickyLeft}>
                    <DatePicker
                        autoOk
                        disableToolbar
                        disabled={!isAllMenuLoaded}
                        variant="inline"
                        inputVariant="outlined"
                        inputProps={{ className: classes.datepickerInput }}
                        label="Use menu for date"
                        value={date}
                        onChange={setDate}
                        minDate={DateTime.local().minus({days: 14})}
                        maxDate={DateTime.local().plus({days: 7})}
                        format="cccc, MMMM d"
                    />
                </div>
                <div className={classes.stickyRight}>
                    <Tooltip
                        arrow
                        placement="bottom"
                        title={authState.email || ''}
                        aria-label={authState.email || ''}
                    >
                        <Typography>
                            {authState.displayName}
                        </Typography>
                    </Tooltip>
                    <Avatar src={authState.photoUrl || undefined} className={classes.userAvatar}>
                        {nameLetters}
                    </Avatar>
                    <Button
                        variant="outlined"
                        className={classes.logoutButton}
                        onClick={logout}
                    >
                        Logout
                    </Button>
                </div>
            </Toolbar>
        </AppBar>
    );
};
