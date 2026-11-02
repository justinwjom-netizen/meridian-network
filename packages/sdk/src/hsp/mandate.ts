import { keccak256, toHex, stringToHex, encodePacked, encodeAbiParameters, parseAbiParameters } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { PaymentConditions, PaymentMandate } from '../types/index.js';

export function normalizeAddress(addr: string | undefined): `0x${string}` {
  if (!addr || addr === '0x0') return '0x0000000000000000000000000000000000000000';
  if (/^0x[0-9a-fA-F]{40}$/.test(addr)) return addr as `0x${string}`;
  const hash = keccak256(stringToHex(addr));
  return `0x${hash.slice(26)}` as `0x${string}`;
}

/**
 * Computes deterministic Keccak256 hash of HSP payment conditions
 */
export function computeConditionsHash(conditions: PaymentConditions): string {
  const encoded = encodeAbiParameters(
    parseAbiParameters('bytes32, address, address, uint256, uint256, bytes32'),
    [
      conditions.orderId.startsWith('0x') ? (conditions.orderId as `0x${string}`) : (keccak256(stringToHex(conditions.orderId)) as `0x${string}`),
      normalizeAddress(conditions.payee),
      normalizeAddress(conditions.token),
      BigInt(conditions.amount),
      BigInt(conditions.expiry),
      conditions.salt.startsWith('0x') ? (conditions.salt as `0x${string}`) : (keccak256(stringToHex(conditions.salt)) as `0x${string}`)
    ]
  );
  return keccak256(encoded);
}

/**
 * Computes deterministic Keccak256 hash of a Payment Mandate
 */
export function computeMandateHash(mandate: PaymentMandate): string {
  const encoded = encodeAbiParameters(
    parseAbiParameters('address, address, address, uint256, bytes32, uint256, uint256, bytes32'),
    [
      normalizeAddress(mandate.payer),
      normalizeAddress(mandate.payee),
      normalizeAddress(mandate.token),
      BigInt(mandate.amount),
      mandate.orderId.startsWith('0x') ? (mandate.orderId as `0x${string}`) : (keccak256(stringToHex(mandate.orderId)) as `0x${string}`),
      BigInt(mandate.nonce),
      BigInt(mandate.expiry),
      mandate.conditionsHash as `0x${string}`
    ]
  );
  return keccak256(encoded);
}

/**
 * Signs payment conditions with merchant agent private key
 */
export async function signPaymentConditions(
  conditions: Omit<PaymentConditions, 'signature'>,
  merchantPrivateKey: `0x${string}`
): Promise<PaymentConditions> {
  const account = privateKeyToAccount(merchantPrivateKey);
  const hash = computeConditionsHash(conditions as PaymentConditions);
  const signature = await account.signMessage({
    message: { raw: hash as `0x${string}` }
  });
  return {
    ...conditions,
    signature
  };
}

/**
 * Builds and signs a Payment Mandate from merchant payment conditions using Strategist session key
 */
export async function buildPaymentMandate(
  conditions: PaymentConditions,
  payerVault: string,
  nonce: number,
  sessionPrivateKey: `0x${string}`
): Promise<PaymentMandate> {
  const account = privateKeyToAccount(sessionPrivateKey);
  const conditionsHash = computeConditionsHash(conditions);

  const unsignedMandate: Omit<PaymentMandate, 'sessionKeySignature'> = {
    payer: payerVault,
    payee: conditions.payee,
    token: conditions.token,
    amount: conditions.amount,
    orderId: conditions.orderId,
    nonce,
    expiry: conditions.expiry,
    conditionsHash
  };

  const mandateHash = computeMandateHash(unsignedMandate as PaymentMandate);
  const sessionKeySignature = await account.signMessage({
    message: { raw: mandateHash as `0x${string}` }
  });

  return {
    ...unsignedMandate,
    sessionKeySignature
  };
}
