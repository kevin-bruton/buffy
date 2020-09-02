import IG from './ig.mjs'

(async () => 
{
  const ig = new IG({isDemo: true});
  await ig.login()

  try {
    const data = await ig.prices('CS.D.EURUSD.MINI.IP?resolution=MINUTE_5');
    console.log(data.prices);
  } catch(e) {
    console.error(e);
  }
})()