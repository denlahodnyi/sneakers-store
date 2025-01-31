import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { ProductForm } from '../_ui';
import { getCategories } from '../../categories/_api/category-server-fn';
import { getBrands } from '../../brands/_api/brand-server-fn';

async function NewProductPage() {
  const [categoriesRes, brandsRes] = await Promise.all([
    getCategories({ active: true }),
    getBrands({ active: true }),
  ]);
  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new product</PageTitle>
      </PageHeaderContainer>
      <ProductForm
        actionType="create"
        brands={brandsRes.brands}
        categories={categoriesRes.categories}
      />
    </PageContentContainer>
  );
}

export default NewProductPage;
