import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getCategories, getCategory } from '../../_api/category-server-fn';
import { CategoryForm } from '../../_ui';

async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const [{ category }, { categories }] = await Promise.all([
    getCategory(categoryId),
    getCategories(),
  ]);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit category</PageTitle>
      </PageHeaderContainer>
      <CategoryForm
        actionType="edit"
        categories={categories}
        defaultValues={category}
        id={categoryId}
      />
    </PageContentContainer>
  );
}

export default EditCategoryPage;
