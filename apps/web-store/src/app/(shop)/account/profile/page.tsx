import { ProfileForm } from './_ui';

function ProfilePage() {
  return (
    <div className="max-w-80 flex-1 sm:px-4">
      <h1 className="mb-4 text-3xl">Profile details</h1>
      <ProfileForm />
    </div>
  );
}

export default ProfilePage;
