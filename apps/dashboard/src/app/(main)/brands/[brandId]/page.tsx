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
import { deleteBrand, getBrand } from '../_api/brand-server-fn';

async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const { brand } = await getBrand(brandId);
  const deleteById = deleteBrand.bind(null, brandId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Brand</PageTitle>
        <PageHeaderActionsContainer>
          <EditRecordLink href={`/brands/${brandId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{brand.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Name</AttributeName>
        <AttributeValue>{brand.name}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Active</AttributeName>
        <AttributeValue>{brand.isActive ? 'Yes' : 'No'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Icon URL</AttributeName>
        <AttributeValue>{brand.iconUrl || 'N/A'}</AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default BrandPage;
