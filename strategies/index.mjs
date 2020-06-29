export {getStrategy}

async function getStrategy(name) {
  const strategy = await import(`./${name}.mjs`)
  return strategy[`${name}Strategy`]
}