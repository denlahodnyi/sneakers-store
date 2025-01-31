import Link from 'next/link';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

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
import { EditorPreview } from '~/shared/ui/rich-text-editor';
import { deleteProduct, getProduct } from '../_api/product-server-fn';

async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { product } = await getProduct(productId);
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
        <AttributeName>Featured</AttributeName>
        <AttributeValue>{product.isFeatured ? 'Yes' : 'No'}</AttributeValue>
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
        {product.descriptionHtml && (
          <EditorPreview html={product.descriptionHtml} />
        )}
      </Attribute>
      <div className="mb-4 flex items-center space-x-5">
        <Typography component="h2" variant="h4">
          Variants
        </Typography>
        <Button
          component={Link}
          href={`/product-variants/new?productId=${productId}`}
          size="large"
          variant="text"
        >
          Add variant
        </Button>
      </div>
      <div className="mb-5 space-y-2">
        {product.variants.map((pv) => (
          <Card
            key={pv.id}
            className="block max-w-[500px] no-underline"
            component={Link}
            href={`/product-variants/${pv.id}`}
            variant="outlined"
          >
            <CardContent>
              <div>
                {pv.color?.hex && <ColorDot hex={pv.color.hex} />}
                {pv.color?.name}
                {pv.name && ` (${pv.name})`}
              </div>
              <Box sx={{ color: 'text.secondary', fontSize: 14 }}>
                ID: {pv.id}
              </Box>
              <div>Name: {pv.name || 'N/A'}</div>
              <div>Discount: {pv.discount?.formattedDiscount || 'N/A'}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mb-4 flex items-center space-x-5">
        <Typography component="h2" variant="h4">
          SKUs
        </Typography>
        <Button
          component={Link}
          href={`/skus/new?productId=${productId}`}
          size="large"
          variant="text"
        >
          Add SKU
        </Button>
      </div>
      <div className="space-y-2">
        {product.skus.map((ps) => (
          <Card
            key={ps.id}
            className="block max-w-[500px] no-underline"
            component={Link}
            href={`/skus/${ps.id}`}
            variant="outlined"
          >
            <CardContent>
              <div>{`SKU: ${ps.sku}`}</div>
              <Box sx={{ color: 'text.secondary', fontSize: 14 }}>
                ID: {ps.id}
              </Box>
              <Box sx={{ color: 'text.secondary', fontSize: 14 }}>
                Variant ID: {ps.productVarId}
              </Box>
              <div>
                Size: <b>{ps.size?.size}</b>
              </div>
              <div>
                Base price: <b>{ps.formattedPrice}</b>
              </div>
              <div>
                Stock quantity: <b>{ps.stockQty}</b>
              </div>
              <div>
                Active: <b>{ps.isActive ? 'Yes' : 'No'}</b>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContentContainer>
  );
}

export default ProductPage;
