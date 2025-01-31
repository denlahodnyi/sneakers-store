import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getProductVariant } from '../../_api/product-var.server-fn';
import { ProductVariantForm } from '../../_ui';
import { getColors } from '../../../colors/_api/color.server-fn';
import { getProducts } from '../../../products/_api/product-server-fn';

async function EditProductVariantPage({
  params,
}: {
  params: Promise<{ productVariantId: string }>;
}) {
  const { productVariantId } = await params;
  const { productVariant } = await getProductVariant(productVariantId);
  const [colorsRes, productsRes] = await Promise.all([
    getColors(),
    getProducts({ priorIds: productVariant.productId }),
  ]);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit product variant</PageTitle>
      </PageHeaderContainer>
      <ProductVariantForm
        actionType="edit"
        colors={colorsRes.colors}
        defaultValues={productVariant}
        id={productVariantId}
        products={productsRes.products}
      />
    </PageContentContainer>
  );
}

export default EditProductVariantPage;
