import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { BrandForm } from '../_ui';

async function NewBrandPage() {
  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new category</PageTitle>
      </PageHeaderContainer>
      <BrandForm actionType="create" />
    </PageContentContainer>
  );
}

export default NewBrandPage;
