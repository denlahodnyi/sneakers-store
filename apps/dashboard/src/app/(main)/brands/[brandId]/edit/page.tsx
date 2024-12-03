import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getBrand } from '../../_api/brand-server-fn';
import { BrandForm } from '../../_ui';

async function EditBrandPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const { brand } = await getBrand(brandId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit brand</PageTitle>
      </PageHeaderContainer>
      <BrandForm actionType="edit" defaultValues={brand} id={brandId} />
    </PageContentContainer>
  );
}

export default EditBrandPage;
