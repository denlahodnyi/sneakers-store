import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getSize } from '../../_api/size-server-fn';
import { SizeForm } from '../../_ui';

async function EditSizePage({
  params,
}: {
  params: Promise<{ sizeId: string }>;
}) {
  const { sizeId } = await params;
  const { size } = await getSize(Number(sizeId));

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit size</PageTitle>
      </PageHeaderContainer>
      <SizeForm actionType="edit" defaultValues={size} id={sizeId} />
    </PageContentContainer>
  );
}

export default EditSizePage;
