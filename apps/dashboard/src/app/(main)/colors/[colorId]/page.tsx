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
import { deleteColor, getColor } from '../_api/color-server-fn';

async function ColorPage({ params }: { params: Promise<{ colorId: string }> }) {
  const { colorId } = await params;
  const { color } = await getColor(colorId);
  const deleteById = deleteColor.bind(null, colorId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Color</PageTitle>
        <PageHeaderActionsContainer>
          <EditRecordLink href={`/colors/${colorId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{color.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Name</AttributeName>
        <AttributeValue>{color.name}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Active</AttributeName>
        <AttributeValue>{color.isActive ? 'Yes' : 'No'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>HEX</AttributeName>
        <AttributeValue>
          <span
            className="mr-2 inline-block min-h-[20px] min-w-[20px] rounded-full align-text-bottom"
            style={{ backgroundColor: color.hex }}
          />
          <span>{color.hex}</span>
        </AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default ColorPage;
