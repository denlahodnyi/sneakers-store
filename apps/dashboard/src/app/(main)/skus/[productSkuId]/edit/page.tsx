import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getProductSku } from '../../_api/sku-server-fn';
import { getSizes } from '../../../sizes/_api/size-server-fn';
import { getProducts } from '../../../products/_api/product-server-fn';
import { SkuForm } from '../../_ui';

async function EditSkuPage({
  params,
}: {
  params: Promise<{ productSkuId: string }>;
}) {
  const { productSkuId } = await params;
  const { productSku } = await getProductSku(productSkuId);
  const [sizesRes, prodRes] = await Promise.all([
    getSizes({ active: true }),
    getProducts({ priorIds: productSku.productId }),
  ]);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit SKU</PageTitle>
      </PageHeaderContainer>
      <SkuForm
        actionType="edit"
        defaultValues={productSku}
        id={productSkuId}
        products={prodRes.products}
        sizes={sizesRes.sizes}
      />
    </PageContentContainer>
  );
}

export default EditSkuPage;
