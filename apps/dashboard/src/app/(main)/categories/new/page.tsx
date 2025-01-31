import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { CategoryForm } from '../_ui';
import { getCategories } from '../_api/category-server-fn';

async function NewCategoryPage() {
  const { categories } = await getCategories({ active: true });

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new category</PageTitle>
      </PageHeaderContainer>
      <CategoryForm actionType="create" categories={categories} />
    </PageContentContainer>
  );
}

export default NewCategoryPage;
