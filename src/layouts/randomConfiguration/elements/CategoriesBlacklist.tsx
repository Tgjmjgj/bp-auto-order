import React from 'react';

import { ConfigStateContext } from '../../../providers/ConfigStateProvider';
import { CategoryItemData } from '../../../components/list/items/CategoryItem';
import { useSetBlackList } from './useSetBlacklist';
import { EditCategoriesList } from '../../../components/list/EditCategoriesList';

type Props = {
    className?: string
}

export const CategoriesBlacklist: React.FC<Props> = props => {
    const { className = '' } = props;
    const configState = React.useContext(ConfigStateContext);
    const config = configState.state.randomConfigs.find(cfg => cfg.id === configState.state.selectedConfig);

    const configCategoriesBlacklist = React.useMemo(() => {
        if (!config) {
            return [];
        }
        return config.config.selectFromTargets.reduce<CategoryItemData[]>((all, targetId) => {
            const targetCategories = config.config.targetsData[targetId].categories;
            all.push(
                ...Object.entries(targetCategories)
                .filter(([categoryName, categoryConfig]) => {
                    return categoryConfig.maxItems === 0 || categoryConfig.weight === 0;
                }).map<CategoryItemData>(([categoryName]) => ({
                    id: `${targetId}_${categoryName}`,
                    name: categoryName,
                    targetId,
                })),
            );
            return all;
        }, []);
    }, [config]);

    const setCategoriesBlacklist = useSetBlackList('categories');

    return (
        <EditCategoriesList
            selectedCategories={configCategoriesBlacklist}
            setSelectedCategories={setCategoriesBlacklist}
            targetIds={config ? config.config.selectFromTargets : []}
            title="Categories blacklist"
            className={className}
        />
    );
};
