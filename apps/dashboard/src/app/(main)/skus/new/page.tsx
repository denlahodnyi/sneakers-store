import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { SkuForm } from '../_ui';
import { getSizes } from '../../sizes/_api/size-server-fn';
import { getProducts } from '../../products/_api/product-server-fn';

async function NewSkuPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const productId = (await searchParams).productId;
  const [sizesRes, prodRes] = await Promise.all([
    getSizes({ active: true }),
    getProducts(),
  ]);
  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new SKU</PageTitle>
      </PageHeaderContainer>
      <SkuForm
        actionType="create"
        defaultValues={productId ? { productId } : undefined}
        products={prodRes.products}
        sizes={sizesRes.sizes}
      />
    </PageContentContainer>
  );
}

export default NewSkuPage;
