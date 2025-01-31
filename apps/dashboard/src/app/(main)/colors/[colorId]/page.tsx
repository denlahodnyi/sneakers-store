import {
  Attribute,
  AttributeName,
  AttributeValue,
  ColorDot,
  DeleteRecordButton,
  EditRecordLink,
  PageContentContainer,
  PageHeaderActionsContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { deleteColor, getColor } from '../_api/color.server-fn';

async function ColorPage({ params }: { params: Promise<{ colorId: string }> }) {
  const { colorId } = await params;
  const { color } = await getColor(Number(colorId));
  const deleteById = deleteColor.bind(null, Number(colorId));

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
          <ColorDot hex={color.hex} />
          <span>{color.hex.join(', ')}</span>
        </AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default ColorPage;
