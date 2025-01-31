import Link from 'next/link';

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
import { deleteProductSku, getProductSku } from '../_api/sku-server-fn';

async function SkuPage({
  params,
}: {
  params: Promise<{ productSkuId: string }>;
}) {
  const { productSkuId } = await params;
  const { productSku } = await getProductSku(productSkuId);
  const deleteById = deleteProductSku.bind(null, productSkuId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>SKU</PageTitle>
        <PageHeaderActionsContainer>
          <EditRecordLink href={`/skus/${productSkuId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{productSku.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Product</AttributeName>
        <AttributeValue>
          <Link href={`/products/${productSku.productId}`}>
            {productSku.product.name}
          </Link>
        </AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Product variant</AttributeName>
        <AttributeValue>
          <Link href={`/product-variants/${productSku.productVarId}`}>
            {productSku.color.name}
          </Link>
        </AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Size</AttributeName>
        <AttributeValue>{productSku.size?.value || 'N/A'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>SKU</AttributeName>
        <AttributeValue>{productSku.sku}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Stock quantity</AttributeName>
        <AttributeValue>{productSku.stockQty}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Base price</AttributeName>
        <AttributeValue>{productSku.formattedPrice}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Active</AttributeName>
        <AttributeValue>{productSku.isActive ? 'Yes' : 'No'}</AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default SkuPage;
