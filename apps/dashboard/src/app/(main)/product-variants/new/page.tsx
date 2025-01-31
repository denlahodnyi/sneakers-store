import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { ProductVariantForm } from '../_ui';
import { getColors } from '../../colors/_api/color.server-fn';
import { getProducts } from '../../products/_api/product-server-fn';

async function NewProductVariantPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const productId = (await searchParams).productId;
  const [colorsRes, productsRes] = await Promise.all([
    getColors({ active: true }),
    getProducts(),
  ]);
  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new product variant</PageTitle>
      </PageHeaderContainer>
      <ProductVariantForm
        actionType="create"
        colors={colorsRes.colors}
        defaultValues={productId ? { productId } : undefined}
        products={productsRes.products}
      />
    </PageContentContainer>
  );
}

export default NewProductVariantPage;
