import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { UserForm } from '../_ui';

async function NewUserPage() {
  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Create new user</PageTitle>
      </PageHeaderContainer>
      <UserForm actionType="create" />
    </PageContentContainer>
  );
}

export default NewUserPage;
