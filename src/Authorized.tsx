import React from 'react';
import cn from 'classnames';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Switch from '@material-ui/core/Switch';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import Container from '@material-ui/core/Container';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MuiAlert from '@material-ui/lab/Alert';
import SettingsIcon from '@material-ui/icons/Settings';
import MenuIcon from '@material-ui/icons/Menu';
import BuildIcon from '@material-ui/icons/Build';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CasinoIcon from '@material-ui/icons/Casino';

import { ConfigStateContext } from './providers/ConfigStateProvider';
import { MenuContext } from './providers/MenuProvider';
import { MainOptions } from './layouts/MainOptions';
import { DeveloperSettings } from './layouts/DeveloperSettings';
import { PresetsScreen } from './layouts/PresetsScreen';
import { RandomConfiguration } from './layouts/randomConfiguration/RandomConfiguration';
import { ManualOrder } from './layouts/ManualOrder';
import { MenuLoader } from './components/MenuLoader';

const menuCategories = ['Main Options', 'Presets', 'Random Configuration', 'Manual Order', 'Developer Settings'] as const;
type MenuCategories = typeof menuCategories[number];

const drawerWidth = 260;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            [theme.breakpoints.up('sm')]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            left: 0,
            marginLeft: theme.spacing(1),
            position: 'absolute',
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
        // necessary for content to be below app bar
        toolbar: {
            justifyContent: 'flex-end',
            [theme.breakpoints.up('sm')]: {
                justifyContent: 'center',
            }
        },
        drawerPaper: {
            marginTop: '60px',
            width: drawerWidth,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            [theme.breakpoints.up('sm')]: {
                marginLeft: drawerWidth,
            },
        },
        contentContainer: {
            margin: `${theme.spacing(3)}px 0`,
        },
        header: {
            height: '60px',
            backgroundColor: theme.palette.secondary.dark,
            zIndex: theme.zIndex.drawer + 1,
        },
        enabled: {
            backgroundColor: '#539e3e',
        },
        enableControl: {
            '& .MuiFormControlLabel-label': {
                ...theme.typography.h6,
            },
        },
    }),
);

export const Authorized: React.FC = () => {

    const classes = useStyles();
    const configState = React.useContext(ConfigStateContext);
    const menuState = React.useContext(MenuContext);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [saveMessageShows, setSaveMessageShows] = React.useState(false);
    const [selectedMenuItem, setSelectMenuItem] = React.useState<MenuCategories>('Main Options');
    const enabled = configState.state.enabled;
    const isAllMenuLoaded = React.useMemo(() => {
        return Object.values(menuState).every(menuData => menuData.loadStatus !== 'not-loaded');
    }, [menuState]);

    const toggleEnabled = React.useCallback(() => {
        configState.updateState({ enabled: !enabled });
    }, [configState, enabled]);

    const toggleMenuOnMobile = React.useCallback(() => setMobileOpen(!mobileOpen), [mobileOpen]);
    const closeSaveMessage = React.useCallback(() => setSaveMessageShows(false), []);
    const onMenuItemClick = React.useCallback((title: MenuCategories) => {
        setSelectMenuItem(title);
        setMobileOpen(false);
    }, []);

    React.useEffect(() => void (configState.saved > 0 && setSaveMessageShows(true)), [configState.saved]);

    const menuCategoriesData: Record<MenuCategories, { component: JSX.Element, icon: JSX.Element }> = React.useMemo(() => ({
        'Main Options': {
            component: <MainOptions />,
            icon: <SettingsIcon />,
        },
        'Presets': {
            component: (isAllMenuLoaded ? <PresetsScreen /> : <MenuLoader />),
            icon: <BookmarksIcon htmlColor={configState.state.mode === 'preset' ? '#e4a918' : undefined} />,
        },
        'Random Configuration': {
            component: (isAllMenuLoaded ? <RandomConfiguration /> : <MenuLoader />),
            icon: <CasinoIcon htmlColor={configState.state.mode === 'random' ? '#da0b0b' : undefined} />,
        },
        'Manual Order': {
            component: (isAllMenuLoaded ? <ManualOrder /> : <MenuLoader />),
            icon: <AssignmentIcon />,
        },
        'Developer Settings': {
            component: <DeveloperSettings />,
            icon: <BuildIcon />,
        },
    }), [configState.state.mode, isAllMenuLoaded]);

    const menu = React.useMemo(() => (
        <div>
            <List>
                {(Object.entries(menuCategoriesData) as [MenuCategories, { component: JSX.Element, icon: JSX.Element }][])
                    .map(([title, data]) => (
                        <ListItem
                            button
                            key={title}
                            onClick={() => onMenuItemClick(title)}
                            selected={selectedMenuItem === title}
                        >
                            <ListItemIcon>
                                {data.icon}
                            </ListItemIcon>
                            <ListItemText primary={title} />
                        </ListItem>
                    ))
                }
            </List>
            <Divider />
        </div>
    ), [menuCategoriesData, onMenuItemClick, selectedMenuItem]);

    return (
        <div className="page-container">
            <AppBar position="sticky" className={cn(classes.header, { [classes.enabled]: enabled })}>
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleMenuOnMobile}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    <FormControlLabel
                        label="Auto order enabled: "
                        labelPlacement="start"
                        className={classes.enableControl}
                        control={
                            <Switch
                                color="primary"
                                size="medium"
                                checked={enabled}
                                onChange={toggleEnabled}
                            />
                        }
                    />
                </Toolbar>
            </AppBar>
            <div className="page-layout">
                <nav className={classes.drawer} aria-label="mailbox folders">
                    <Hidden smUp implementation="css">
                        <Drawer
                            variant="temporary"
                            anchor="left"
                            open={mobileOpen}
                            onClose={toggleMenuOnMobile}
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            ModalProps={{
                                keepMounted: true, // Better open performance on mobile.
                            }}
                        >
                            {menu}
                        </Drawer>
                    </Hidden>
                    <Hidden xsDown implementation="css">
                        <Drawer
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            variant="permanent"
                            open
                        >
                            {menu}
                        </Drawer>
                    </Hidden>
                </nav>
                <main className={classes.content}>
                    <Container className={classes.contentContainer}>
                        {menuCategoriesData[selectedMenuItem].component}
                    </Container>
                </main>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={saveMessageShows}
                    autoHideDuration={3000}
                    onClose={closeSaveMessage}
                >
                    <MuiAlert elevation={6} variant="filled" onClose={closeSaveMessage} severity="success">
                        Configuration successfully saved
                    </MuiAlert>
                </Snackbar>
            </div>
        </div>
    );
};
