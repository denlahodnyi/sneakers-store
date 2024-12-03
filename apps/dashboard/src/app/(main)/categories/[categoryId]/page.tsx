import {
  Attribute,
  AttributeName,
  AttributeValue,
  DeleteRecordButton,
  EditRecordLink,
  PageContentContainer,
  PageHeaderActionsContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { deleteCategory, getCategory } from '../_api/category-server-fn';

async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const { category } = await getCategory(categoryId);
  const deleteById = deleteCategory.bind(null, categoryId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Category</PageTitle>
        <PageHeaderActionsContainer>
          <EditRecordLink href={`/categories/${categoryId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{category.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Name</AttributeName>
        <AttributeValue>{category.name}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Active</AttributeName>
        <AttributeValue>{category.isActive ? 'Yes' : 'No'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Parent ID</AttributeName>
        <AttributeValue>{category.parentId || 'N/A'}</AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default CategoryPage;
