import React from 'react';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import { DialogsContext } from '../../providers/DialogsProvider';
import { MenuContext } from '../../providers/MenuProvider';
import { ItemsList } from './ItemsList';
import { CategoryItem, CategoryItemData } from './items/CategoryItem';
import { ListDialogFilter } from './ListDialog';


type Props = {
    title: string
    className?: string
    targetIds: string[]
    selectedCategories: CategoryItemData[]
    setSelectedCategories: (categories: CategoryItemData[]) => void
};

const initialFilterValue: ListDialogFilter = {
    search: '',
    switches: {},
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        row: {
            display: 'flex',
            alignItems: 'center',
        },
        listTitle: {
            margin: theme.spacing(4, 0, 2),
        },
    }),
);

export const EditCategoriesList: React.FC<Props> = props => {
    const {
        title,
        targetIds,
        selectedCategories,
        setSelectedCategories,
        className = '',
    } = props;
    const classes = useStyles();
    const dialogsContext = React.useContext(DialogsContext);
    const menuContext = React.useContext(MenuContext);
    const [openSelectDialog, setOpenSelectDialog] = React.useState(false);

    const onCloseDialog = React.useCallback(() => {
        setOpenSelectDialog(false);
        dialogsContext.closeDialog();
    }, [dialogsContext]);

    console.log('selectedItem: ', selectedCategories);

    const allItems = React.useMemo(() => {
        return targetIds.flatMap(targetId => {
            const targetMenu = menuContext[targetId] || [];
            return uniq(
                targetMenu.map<string>(menuItem => menuItem.category)
            ).map<CategoryItemData>(category => ({
                id: `${targetId}_${category}`,
                name: category,
                targetId,
            }));
        });
    }, [targetIds, menuContext]);

    const onClickItem = React.useCallback((item: CategoryItemData) => {
        const delIndex = selectedCategories.findIndex(category => category.id === item.id);
        if (delIndex !== -1) {
            setSelectedCategories([
                ...selectedCategories.slice(0, delIndex),
                ...selectedCategories.slice(delIndex + 1, selectedCategories.length),
            ]);
        } else {
            setSelectedCategories([
                ...selectedCategories,
                item,
            ]);
        }
    }, [selectedCategories, setSelectedCategories]);

    const renderItem = React.useCallback((item: CategoryItemData) => {
        const selected = !!selectedCategories.find(category => category.id === item.id);
        return (
            <CategoryItem
                item={item}
                key={item.id}
                selected={selected}
                onClick={onClickItem}
            />
        );
    }, [selectedCategories, onClickItem]);

    const filterItems = React.useCallback((filter: ListDialogFilter) => {
        return allItems.filter(item => item.name.toLowerCase().includes(filter.search.toLowerCase()));
    }, [allItems]);

    console.log('openSelectDialog: ', openSelectDialog);

    React.useEffect(() => () => console.log('#### EditCategoriesList UNMOUNT'), []);

    React.useEffect(() => {
        if (openSelectDialog) {
            dialogsContext.setupDialog<CategoryItemData>({
                onCloseDialog,
                title: 'Select menu category',
                renderItem,
                filter: initialFilterValue,
                filterItems,
            });
        }
    }, [
        dialogsContext,
        openSelectDialog,
        onCloseDialog,
        renderItem,
        filterItems,
    ]);

    const editList = React.useCallback(() => {
        setOpenSelectDialog(true);
    }, []);

    const removeItem = React.useCallback((item: CategoryItemData) => {
        const delIndex = selectedCategories.findIndex(category => isEqual(category, item));
        if (delIndex === -1 ) {
            return;
        }
        setSelectedCategories([
            ...selectedCategories.slice(0, delIndex),
            ...selectedCategories.slice(delIndex + 1, selectedCategories.length),
        ]);
    }, [selectedCategories, setSelectedCategories]);

    return (
        <>
            <div className={classes.row}>
                <Typography variant="h6" className={classes.listTitle}>
                    {title}
                </Typography>
                <Tooltip
                    arrow
                    placement="right"
                    title="Edit"
                    aria-label="Edit"
                >
                    <IconButton onClick={editList}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <div className={className}>
                <ItemsList
                    items={selectedCategories}
                    removeItem={removeItem}
                />
            </div>
        </>
    );
};
