import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { SizeForm } from '../_ui';

async function NewSizePage() {
  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new size</PageTitle>
      </PageHeaderContainer>
      <SizeForm actionType="create" />
    </PageContentContainer>
  );
}

export default NewSizePage;
