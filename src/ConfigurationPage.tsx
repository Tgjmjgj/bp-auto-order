import React from 'react';
import cn from 'classnames';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SettingsIcon from '@material-ui/icons/Settings';
import MenuIcon from '@material-ui/icons/Menu';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import Container from '@material-ui/core/Container';
import MuiAlert from '@material-ui/lab/Alert';

import {ConfigStateContext} from './ConfigStateProvider';
import { DeveloperConfig } from './layouts/DeveloperConfig';

const menuCategories = ['Configuration', 'Generator', 'Options', 'Developer Settings'] as const;
type MenuCategories = typeof menuCategories[number];

const drawerWidth = 240;

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
    })
);

const mainLayouts: Record<MenuCategories, JSX.Element> = {
    'Configuration': <div/>,
    'Generator': <div/>,
    'Options': <div/>,
    'Developer Settings': <DeveloperConfig />,
};

export const ConfigurationPage: React.FC = () => {

    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [saveMessageShows, setSaveMessageShows] = React.useState(false);
    const [selectedMenuItem, setSelectMenuItem] = React.useState<MenuCategories>('Configuration');
    const configState = React.useContext(ConfigStateContext);
    const enabled = configState.state.enabled;
    const classes = useStyles();

    const toggleEnabled = () => {
        console.log('toggle enabled');
        configState.updateState({enabled: !enabled});
    };
    const toggleMenuOnMobile = () => setMobileOpen(!mobileOpen);
    const closeSaveMessage = () => setSaveMessageShows(false);

    React.useEffect(() => void (configState.saved > 0 && setSaveMessageShows(true)), [configState.saved]);

    const menu = (
        <div>
            <List>
                {menuCategories.map(menuCategory => (
                    <ListItem
                        button
                        key={menuCategory}
                        onClick={() => setSelectMenuItem(menuCategory)}
                    >
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary={menuCategory} />
                    </ListItem>
                ))}
            </List>
            <Divider />
        </div>
    );

    return (
        <div className="page-container">
            <AppBar position="static" className={cn('header', { 'enabled': enabled })}>
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
                    <Typography variant="h6">
                        Auto order enabled:
                    </Typography>
                    <Switch checked={enabled} onChange={toggleEnabled} size="medium" color="primary" />
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
                        {mainLayouts[selectedMenuItem]}
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
