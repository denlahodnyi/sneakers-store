import { notFound } from 'next/navigation';

import {
  Attribute,
  AttributeName,
  AttributeValue,
  DeleteRecordButton,
  EditRecordLink,
  PageContentContainer,
  PageHeaderActionsContainer,
  PageHeaderContainer,
  PageTitle,
} from '~/shared/ui/page-blocks';
import { deleteUser, getUser } from '../_api/user.server-fn';

async function UserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { user } = await getUser(userId);
  const deleteById = deleteUser.bind(null, userId);

  if (!user) {
    notFound();
  }

  return (
    <PageContentContainer>
      <PageHeaderContainer>
        <PageTitle>User</PageTitle>
        <PageHeaderActionsContainer>
          <EditRecordLink href={`/users/${userId}/edit`} />
          <DeleteRecordButton onDelete={deleteById} />
        </PageHeaderActionsContainer>
      </PageHeaderContainer>

      <Attribute>
        <AttributeName>ID</AttributeName>
        <AttributeValue>{user.id}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Name</AttributeName>
        <AttributeValue>{user.name}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Email</AttributeName>
        <AttributeValue>{user.email}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Email verified</AttributeName>
        <AttributeValue>{user.emailVerified || 'N/A'}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Phone</AttributeName>
        <AttributeValue>{user.phone}</AttributeValue>
      </Attribute>
      <Attribute>
        <AttributeName>Role</AttributeName>
        <AttributeValue>{user.role}</AttributeValue>
      </Attribute>
    </PageContentContainer>
  );
}

export default UserPage;
