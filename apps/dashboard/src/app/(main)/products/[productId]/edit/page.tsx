import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getProduct } from '../../_api/product-server-fn';
import { ProductForm } from '../../_ui';
import { getCategories } from '../../../categories/_api/category-server-fn';
import { getBrands } from '../../../brands/_api/brand-server-fn';

async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { product } = await getProduct(productId);
  const [categoriesRes, brandsRes] = await Promise.all([
    getCategories({ active: true }),
    getBrands({ active: true }),
  ]);

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit product</PageTitle>
      </PageHeaderContainer>
      <ProductForm
        actionType="edit"
        brands={brandsRes.brands}
        categories={categoriesRes.categories}
        defaultValues={product}
        id={productId}
      />
    </PageContentContainer>
  );
}

export default EditProductPage;
