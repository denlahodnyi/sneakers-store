import Link from 'next/link';
import { Typography } from '@mui/material';

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
  RecordLinkBase,
} from '~/shared/ui/page-blocks';
import { deleteProduct, getProduct } from '../_api/product-server-fn';
import { getProductVariants } from '../../product-variants/_api/product-var-server-fn';
import { getProductSkus } from '../../skus/_api/sku-server-fn';

async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { product } = await getProduct(productId);
  const { productVariants } = await getProductVariants({
    productId,
    fields: 'color',
  });
  const { productSkus } = await getProductSkus({ productId });
  const deleteById = deleteProduct.bind(null, productId);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Product</PageTitle>
        <PageHeaderActionsContainer>
          <RecordLinkBase href={`/product-variants/new?productId=${productId}`}>
            Add variant
          </RecordLinkBase>
          <EditRecordLink href={`/products/${productId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{product.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Name</AttributeName>
        <AttributeValue>{product.name}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Active</AttributeName>
        <AttributeValue>{product.isActive ? 'Yes' : 'No'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Category</AttributeName>
        <AttributeValue>
          <Link href={`/categories/${product.categoryId}`}>
            {product.category}
          </Link>
        </AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Brand</AttributeName>
        <AttributeValue>
          <Link href={`/brands/${product.brandId}`}>{product.brand}</Link>
        </AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Gender</AttributeName>
        <AttributeValue>{product.gender}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Description</AttributeName>
        <AttributeValue>{product.description || 'N/A'}</AttributeValue>
      </Attribute>
      <Typography component="h2" sx={{ mb: 4 }} variant="h4">
        Variants
      </Typography>
      <div className="mb-5 space-y-2">
        {productVariants.map((pv) => (
          <Link
            key={pv.id}
            className="block"
            href={`/product-variants/${pv.id}`}
          >
            {pv.color?.hex && <ColorDot hex={pv.color.hex} />}
            {pv.color?.name}
          </Link>
        ))}
      </div>
      <Typography component="h2" sx={{ mb: 4 }} variant="h4">
        SKUs
      </Typography>
      <div className="space-y-2">
        {productSkus.map((ps) => (
          <Link key={ps.id} className="block" href={`/skus/${ps.id}`}>
            {ps.sku}
          </Link>
        ))}
      </div>
    </PageContentContainer>
  );
}

export default ProductPage;
