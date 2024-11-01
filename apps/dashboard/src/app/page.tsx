import { getClient } from '~/shared/api';

const client = getClient();

export default async function Home() {
  const planet = await (
    await fetch('https://swapi.dev/api/planets/1', {
      next: {
        revalidate: 0,
      },
    })
  ).json();
  const data = await client.getRoot({
    fetchOptions: {
      next: {
        revalidate: 0,
      },
    },
  });

  return (
    <div>
      <h1>Admin dashboard</h1>
      <p>{planet.name}</p>
      <p>{data.status === 200 && data.body.status}</p>
    </div>
  );
}
