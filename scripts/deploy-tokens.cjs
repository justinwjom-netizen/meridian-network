/**
 * Deploy test tokens (MockERC20) + a MockHSKSwap on the target network,
 * mint balances to the already-deployed PolicyVault, set a HSK/USDT rate,
 * and allowlist them in the vault. Reads the vault from deployments/<network>.json.
 *
 *   npm run deploy:tokens:testnet
 */
const hre = require("hardhat");
const { ethers, network } = hre;
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const depFile = path.join(process.cwd(), "deployments", `${network.name}.json`);
  const dep = JSON.parse(fs.readFileSync(depFile, "utf8"));
  const vaultAddr = dep.contracts.PolicyVault;
  const GAS = { gasLimit: 220000 };
  console.log(`\nNetwork: ${network.name}\nVault:   ${vaultAddr}\n`);

  const ERC = await ethers.getContractFactory("MockERC20");
  const usdt = await ERC.deploy("Meridian Test USDT", "USDT", 6); await usdt.waitForDeployment();
  const hsk = await ERC.deploy("Meridian Test HSK", "HSK", 18); await hsk.waitForDeployment();
  const weth = await ERC.deploy("Meridian Test WETH", "WETH", 18); await weth.waitForDeployment();
  const uA = await usdt.getAddress(), hA = await hsk.getAddress(), wA = await weth.getAddress();
  console.log("USDT ", uA); console.log("HSK  ", hA); console.log("WETH ", wA);

  await (await usdt.mint(vaultAddr, 10_000n * 10n ** 6n, GAS)).wait();
  await (await hsk.mint(vaultAddr, 5_000n * 10n ** 18n, GAS)).wait();
  await (await weth.mint(vaultAddr, 5n * 10n ** 18n, GAS)).wait();
  console.log("minted vault balances");

  const swap = await (await ethers.getContractFactory("MockHSKSwap")).deploy(); await swap.waitForDeployment();
  const sA = await swap.getAddress();
  await (await swap.setRate(hA, uA, 25n * 10n ** 17n, GAS)).wait(); // HSK/USDT = 2.5
  await (await swap.setRate(uA, hA, 4n * 10n ** 17n, GAS)).wait();  // USDT/HSK = 0.4
  console.log("HSKSwap", sA);

  const vault = await ethers.getContractAt("PolicyVault", vaultAddr);
  for (const t of [uA, hA, wA]) { await (await vault.setAllowedToken(t, true, GAS)).wait(); }
  await (await vault.setAllowedPool(sA, true, GAS)).wait();
  console.log("allowlisted tokens + pool in vault");

  dep.tokens = { USDT_ADDRESS: uA, HSK_ADDRESS: hA, WETH_ADDRESS: wA, HSKSWAP_ROUTER: sA };
  fs.writeFileSync(depFile, JSON.stringify(dep, null, 2));
  console.log(`\n✓ Saved token addresses → deployments/${network.name}.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
