import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { ColorForm } from '../_ui';

async function NewColorPage() {
  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new color</PageTitle>
      </PageHeaderContainer>
      <ColorForm actionType="create" />
    </PageContentContainer>
  );
}

export default NewColorPage;
