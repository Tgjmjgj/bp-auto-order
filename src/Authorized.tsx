import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import Container from '@material-ui/core/Container';
import MuiAlert from '@material-ui/lab/Alert';
import SettingsIcon from '@material-ui/icons/Settings';
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
import { OrderHistory } from './layouts/orderHistory/OrderHistory';
import { MenuLoader } from './components/MenuLoader';
import { NotificationBar } from './components/NotificationBar';
import { Header } from './components/Header';

const menuCategories = [
    'Main Options',
    'Presets',
    'Random Configuration',
    'Manual Order',
    'Developer Settings',
] as const;

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
        drawerPaper: {
            marginTop: '60px',
            width: drawerWidth,
        },
        contentWrapper: {
            position: 'relative',
            flexGrow: 1,
            height: 'calc(100% - 64px)',
            overflow: 'auto',
            [theme.breakpoints.up('sm')]: {
                marginLeft: drawerWidth,
            },
        },
        content: {
            padding: theme.spacing(3),
        },
        notification: {
            position: 'absolute',
            top: 0,
            width: '100%',
            backgroundColor: '#efefb0',
        },
        contentContainer: {
            margin: `${theme.spacing(3)}px 0`,
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

    const isAllMenuLoaded = React.useMemo(() => {
        return Object.values(menuState).every(menuData => menuData.loadStatus !== 'not-loaded');
    }, [menuState]);

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
        'Order History': {
            component: <OrderHistory />,
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
            <Header
                toggleMenu={toggleMenuOnMobile}
            />
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
                <main className={classes.contentWrapper}>
                    <div className={classes.content}>
                        <Container className={classes.contentContainer}>
                            {menuCategoriesData[selectedMenuItem].component}
                        </Container>
                    </div>
                    <div className={classes.notification}>
                        <NotificationBar />
                    </div>
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
