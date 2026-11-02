import assert from 'node:assert';
import {
  signPaymentConditions,
  buildPaymentMandate,
  HSPGateway
} from '@meridian/sdk';

async function testMCPCapabilities() {
  console.log('\n[MCP Test] Testing Meridian MCP Server Capabilities');

  const gateway = new HSPGateway();
  const MERCHANT_KEY = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' as `0x${string}`;
  const STRATEGIST_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`;
  const VAULT = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

  // 1. meridian-pay-mcp: create_payment_conditions
  const conditions = await signPaymentConditions(
    {
      orderId: 'mcp_test_order_1',
      payee: '0x1111111111111111111111111111111111111111',
      token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      amount: '50000',
      expiry: Math.floor(Date.now() / 1000) + 300,
      salt: 'mcp_salt_123',
      service: 'ALPHA_SIGNAL'
    },
    MERCHANT_KEY
  );
  assert.ok(conditions.signature);
  console.log('✓ meridian-pay-mcp: create_payment_conditions returned valid signed conditions');

  // 2. meridian-pay-mcp: build_mandate
  const mandate = await buildPaymentMandate(conditions, VAULT, 1, STRATEGIST_KEY);
  assert.ok(mandate.sessionKeySignature);
  console.log('✓ meridian-pay-mcp: build_mandate created valid mandate signed by session key');

  // 3. meridian-pay-mcp: submit_mandate
  const receipt = await gateway.submitMandate(mandate);
  assert.strictEqual(receipt.status, 'SETTLED');
  console.log('✓ meridian-pay-mcp: submit_mandate settled on-chain payment');

  // 4. meridian-pay-mcp: verify_settlement
  const verified = await gateway.verifySettlement('mcp_test_order_1');
  assert.strictEqual(verified?.status, 'SETTLED');
  console.log('✓ meridian-pay-mcp: verify_settlement confirmed receipt');

  // 5. meridian-pay-mcp: list_payments
  const list = await gateway.listSettlements();
  assert.strictEqual(list.length, 1);
  console.log('✓ meridian-pay-mcp: list_payments returned settled ledger');

  console.log('✓ All Meridian MCP Core Capabilities Verified\n');
}

testMCPCapabilities().catch(err => {
  console.error('MCP test failed:', err);
  process.exit(1);
});
