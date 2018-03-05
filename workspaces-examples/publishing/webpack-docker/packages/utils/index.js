export function greeting(name) {
  return `hello ${name || ""}`;
}

export async function repeat(func, interval, max, ...args) {
  const _max = max || 10;
  const _interval = interval || 1000;

  let count = 0;

  const f = resolve => {
    func(args);
    if (++count >= _max) {
      resolve();
    } else {
      setTimeout(f, _interval, resolve);
    }
  };

  return new Promise(resolve => {
    setTimeout(f, _interval, resolve);
  });
}
