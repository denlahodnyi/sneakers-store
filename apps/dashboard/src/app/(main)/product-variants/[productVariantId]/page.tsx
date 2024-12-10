import Link from 'next/link';

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
import {
  deleteProductVariant,
  getProductVariant,
} from '../_api/product-var-server-fn';
import { getProduct } from '../../products/_api/product-server-fn';

async function ProductVariantPage({
  params,
}: {
  params: Promise<{ productVariantId: string }>;
}) {
  const { productVariantId } = await params;
  const { productVariant } = await getProductVariant(productVariantId);
  const { product } = await getProduct(productVariant.productId);
  const deleteById = deleteProductVariant.bind(null, productVariantId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Product variant</PageTitle>
        <PageHeaderActionsContainer>
          <EditRecordLink href={`/product-variants/${productVariantId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{productVariant.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Product</AttributeName>
        <AttributeValue>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Color</AttributeName>
        <AttributeValue>
          <ColorDot hex={productVariant.color.hex} />
          {productVariant.color.name}
        </AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default ProductVariantPage;
