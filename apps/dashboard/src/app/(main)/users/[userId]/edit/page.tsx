import { notFound } from 'next/navigation';

import {
  PageContentContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { getUser } from '../../_api/user.server-fn';
import { UserForm } from '../../_ui';

async function EditBrandPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { user } = await getUser(userId);

  if (!user) {
    notFound();
  }

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>Edit brand</PageTitle>
      </PageHeaderContainer>
      <UserForm actionType="edit" defaultValues={user} id={userId} />
    </PageContentContainer>
  );
}

export default EditBrandPage;
