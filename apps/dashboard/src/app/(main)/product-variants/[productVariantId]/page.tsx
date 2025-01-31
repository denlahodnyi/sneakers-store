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
  PageSecondaryTitle,
  PageTitle,
} from '~/shared/ui/page-blocks';
import {
  deleteProductVariant,
  getProductVariant,
} from '../_api/product-var.server-fn';
import { getProduct } from '../../products/_api/product-server-fn';
import {
  EditableProductImage,
  CreateProductImgUploader,
  AddDiscount,
  DiscountItem,
} from '../_ui';
import { getDiscounts } from '../_api/discounts.server-fn';

async function ProductVariantPage({
  params,
}: {
  params: Promise<{ productVariantId: string }>;
}) {
  const { productVariantId } = await params;
  const [{ productVariant }, { discounts }] = await Promise.all([
    getProductVariant(productVariantId),
    getDiscounts({ productVarId: productVariantId }),
  ]);
  const { product } = await getProduct(productVariant.productId);
  const sortedDiscounts = discounts.sort((a) => (a.isActive ? -1 : 1));
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
      <Attribute>
        <AttributeName>Name</AttributeName>
        <AttributeValue>{productVariant.name || 'N/A'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Slug</AttributeName>
        <AttributeValue>{productVariant.slug || 'N/A'}</AttributeValue>
      </Attribute>

      <div className="mb-3 flex gap-3">
        <PageSecondaryTitle>Images</PageSecondaryTitle>
        <CreateProductImgUploader productVarId={productVariant.id} />
      </div>
      <div className="mb-5 flex gap-2">
        {productVariant.images.map((img) => (
          <EditableProductImage
            key={img.id}
            alt={img.alt || ''}
            imageId={img.id}
            publicId={img.publicId}
            url={img.url}
          />
        ))}
      </div>

      <PageSecondaryTitle className="mb-3">Discounts</PageSecondaryTitle>
      <div className="mb-4 flex flex-col gap-2">
        {sortedDiscounts.map((d) => (
          <DiscountItem key={d.id} discount={d} />
        ))}
      </div>
      <AddDiscount productVariantId={productVariantId} />
    </PageContentContainer>
  );
}

export default ProductVariantPage;
