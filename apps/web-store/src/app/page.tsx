export default async function Home() {
  const planet = await (
    await fetch('https://swapi.dev/api/planets/1', {
      next: {
        revalidate: 0,
      },
    })
  ).json();

  return (
    <div>
      <h1>Shop</h1>
      <p>{planet.name}</p>
    </div>
  );
}
