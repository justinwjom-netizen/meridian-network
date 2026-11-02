import { keccak256, stringToHex, recoverMessageAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { A2AEnvelope } from '../types/index.js';

export function computeA2AMessageHash(envelope: Omit<A2AEnvelope, 'signature'>): `0x${string}` {
  const content = JSON.stringify({
    version: envelope.version,
    id: envelope.id,
    from: envelope.from.toLowerCase(),
    to: envelope.to.toLowerCase(),
    method: envelope.method,
    params: envelope.params,
    timestamp: envelope.timestamp
  });
  return keccak256(stringToHex(content));
}

export async function createSignedA2AEnvelope<T = any>(
  fromPrivateKey: `0x${string}`,
  toAddress: string,
  method: string,
  params: T
): Promise<A2AEnvelope<T>> {
  const account = privateKeyToAccount(fromPrivateKey);
  const unsignedEnvelope: Omit<A2AEnvelope<T>, 'signature'> = {
    version: '1.0',
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    from: account.address,
    to: toAddress,
    method,
    params,
    timestamp: Date.now()
  };

  const hash = computeA2AMessageHash(unsignedEnvelope);
  const signature = await account.signMessage({
    message: { raw: hash }
  });

  return {
    ...unsignedEnvelope,
    signature
  };
}

export async function verifyA2AEnvelope(envelope: A2AEnvelope): Promise<boolean> {
  if (!envelope.signature) return false;

  const unsignedEnvelope: Omit<A2AEnvelope, 'signature'> = {
    version: envelope.version,
    id: envelope.id,
    from: envelope.from,
    to: envelope.to,
    method: envelope.method,
    params: envelope.params,
    timestamp: envelope.timestamp
  };

  const hash = computeA2AMessageHash(unsignedEnvelope);
  const recoveredSigner = await recoverMessageAddress({
    message: { raw: hash },
    signature: envelope.signature as `0x${string}`
  });

  return recoveredSigner.toLowerCase() === envelope.from.toLowerCase();
}
