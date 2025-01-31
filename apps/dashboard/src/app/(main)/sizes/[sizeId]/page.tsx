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
import { deleteSize, getSize } from '../_api/size-server-fn';

async function SizePage({ params }: { params: Promise<{ sizeId: string }> }) {
  const { sizeId } = await params;
  const { size } = await getSize(Number(sizeId));
  const deleteById = deleteSize.bind(null, Number(sizeId));

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Size</PageTitle>
        <PageHeaderActionsContainer>
          <EditRecordLink href={`/sizes/${sizeId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{size.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Size</AttributeName>
        <AttributeValue>{size.size}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Active</AttributeName>
        <AttributeValue>{size.isActive ? 'Yes' : 'No'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Size system</AttributeName>
        <AttributeValue>{size.system || 'N/A'}</AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default SizePage;
