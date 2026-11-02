/**
 * Meridian — on-chain deployment
 *
 *   npm run deploy:local      (Hardhat in-memory — dry run)
 *   npm run deploy:testnet    (HSK testnet 133)
 *   npm run deploy            (HSK mainnet 177)
 *
 * Reads addresses/keys from .env, deploys the four Meridian contracts, wires
 * allowlists + session key, and writes deployments/<network>.json.
 */
const hre = require("hardhat");
const { ethers, network } = hre;
const fs = require("node:fs");
const path = require("node:path");

function addrFromKey(key) {
  if (!key) return undefined;
  try { return new ethers.Wallet(key).address; } catch { return undefined; }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const env = process.env;
  console.log(`\nNetwork: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} native\n`);

  const perTradeCap = env.PER_TRADE_CAP || "500000000";
  const dailyLossLimit = env.DAILY_LOSS_LIMIT || "100000000";
  const dailyAgentCap = env.DAILY_AGENT_CAP || "20000000";
  const maxSlippageBps = env.MAX_SLIPPAGE_BPS || "100";
  const auditorAddr = env.AUDITOR_ADDRESS || addrFromKey(env.AUDITOR_KEY) || deployer.address;

  const mandate = await (await ethers.getContractFactory("MandateRegistry")).deploy();
  await mandate.waitForDeployment();
  console.log("MandateRegistry     ", await mandate.getAddress());

  const pnl = await (await ethers.getContractFactory("PnLAttestation")).deploy(auditorAddr);
  await pnl.waitForDeployment();
  console.log("PnLAttestation      ", await pnl.getAddress());

  const rep = await (await ethers.getContractFactory("ReputationRegistry")).deploy();
  await rep.waitForDeployment();
  console.log("ReputationRegistry  ", await rep.getAddress());

  const vault = await (await ethers.getContractFactory("PolicyVault")).deploy(
    await mandate.getAddress(), perTradeCap, dailyLossLimit, dailyAgentCap, maxSlippageBps
  );
  await vault.waitForDeployment();
  console.log("PolicyVault         ", await vault.getAddress(), "\n");

  // explicit gasLimit: some RPCs under-estimate a cold SSTORE and the tx runs out of gas
  const GAS = { gasLimit: 200000 };

  const tokens = [env.USDT_ADDRESS, env.HSK_ADDRESS, env.WETH_ADDRESS].filter(Boolean);
  for (const t of tokens) { await (await vault.setAllowedToken(t, true, GAS)).wait(); console.log("allow token  ", t); }

  const pools = [env.HSKSWAP_ROUTER, env.HSKSWAP_POOL_HSK_USDT, env.HSKSWAP_POOL_WETH_USDT].filter(Boolean);
  for (const p of pools) { await (await vault.setAllowedPool(p, true, GAS)).wait(); console.log("allow pool   ", p); }

  const payees = [
    env.SIGNAL_ADDRESS || addrFromKey(env.SIGNAL_KEY),
    env.RISK_ADDRESS || addrFromKey(env.RISK_KEY),
    env.EXECUTION_ADDRESS || addrFromKey(env.EXECUTION_KEY),
    env.AUDITOR_ADDRESS || addrFromKey(env.AUDITOR_KEY)
  ].filter(Boolean);
  for (const p of payees) { await (await vault.setAllowedPayee(p, true, GAS)).wait(); console.log("allow payee  ", p); }

  const sessionKey = env.STRATEGIST_ADDRESS || addrFromKey(env.STRATEGIST_SESSION_KEY);
  if (sessionKey) {
    const validUntil = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;
    await (await vault.setSessionKey(sessionKey, true, validUntil, { gasLimit: 200000 })).wait();
    console.log("session key  ", sessionKey);
  }

  const out = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      PolicyVault: await vault.getAddress(),
      MandateRegistry: await mandate.getAddress(),
      PnLAttestation: await pnl.getAddress(),
      ReputationRegistry: await rep.getAddress()
    },
    config: { perTradeCap, dailyLossLimit, dailyAgentCap, maxSlippageBps, auditor: auditorAddr, tokens, pools, payees }
  };
  fs.mkdirSync(path.join(process.cwd(), "deployments"), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), "deployments", `${network.name}.json`), JSON.stringify(out, null, 2));
  console.log(`\n✓ Saved → deployments/${network.name}.json`);
  console.log("  Copy VAULT_ADDRESS + contract addresses into .env, then restart the server.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
