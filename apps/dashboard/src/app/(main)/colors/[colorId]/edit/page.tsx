import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getColor } from '../../_api/color-server-fn';
import { ColorForm } from '../../_ui';

async function EditColorPage({
  params,
}: {
  params: Promise<{ colorId: string }>;
}) {
  const { colorId } = await params;
  const { color } = await getColor(colorId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit color</PageTitle>
      </PageHeaderContainer>
      <ColorForm actionType="edit" defaultValues={color} id={colorId} />
    </PageContentContainer>
  );
}

export default EditColorPage;
