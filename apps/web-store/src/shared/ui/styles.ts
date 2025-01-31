const getConicGradientFromHexes = (hexes: string[]) => {
  const parts: [string, number, number][] = [];
  const turn = 1 / hexes.length;
  hexes.forEach((hex, i) => {
    const prev = parts[i - 1] ? parts[i - 1][2] : 0;
    parts.push([hex, prev, prev + turn]);
  });
  return `conic-gradient(${parts.map((p) => `${p[0]} ${p[1]}turn ${p[2]}turn`).join(', ')})`;
};

export { getConicGradientFromHexes };
