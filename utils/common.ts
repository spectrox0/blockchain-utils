export const wait = async (ms = 0) =>
  new Promise<void>(r => {
    setTimeout(r, ms);
  });
