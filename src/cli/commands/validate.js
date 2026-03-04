/**
 * validate.js — CLI Validate Command
 * 
 * PENJELASAN:
 * ==========
 * Command untuk memvalidasi alamat crypto dari terminal.
 * Bisa validasi single address atau batch dari file.
 * 
 * Contoh penggunaan:
 * $ web3-wallet validate 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28
 * $ web3-wallet validate --file addresses.txt
 * $ web3-wallet validate --batch "0x742d...,5eykt...,bc1q..."
 */

import chalk from 'chalk';
import { readFileSync, existsSync } from 'fs';
import { validateAddress, getSupportedChains } from '../../core/generator.js';
import { createSpinner, renderSummary, formatNumber } from '../ui.js';
import logger from '../../utils/logger.js';

/**
 * Detect chain from address format
 * 
 * @param {string} address - Address to detect
 * @returns {string|null} - Chain name atau null
 */
function detectChain(address) {
  if (!address || address.length < 20) return null;
  const a = address.trim();
  
  if (/^0x0[0-9a-fA-F]{63}$/.test(a)) return 'starknet';
  if (/^0x[0-9a-fA-F]{64}$/.test(a)) return 'sui';
  if (/^0x[0-9a-fA-F]{40}$/.test(a)) return 'evm';
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)) return 'tron';
  if (/^(bc1|1|3)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(a)) return 'bitcoin';
  if (/^(cosmos|osmo)[a-z0-9]{38,45}$/.test(a)) return 'cosmos';
  if (/^(EQ|UQ)[A-Za-z0-9_-]{46}$/.test(a)) return 'ton';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)) return 'solana';
  
  return null;
}

/**
 * Handler untuk command `validate`
 */
export async function handleValidate(args, options) {
  const { file, batch } = options;
  
  // Collect addresses to validate
  let addresses = [];
  
  // Single address from positional arg
  if (args && args.length > 0) {
    addresses.push(...args);
  }
  
  // Batch from comma-separated string
  if (batch) {
    addresses.push(...batch.split(',').map(a => a.trim()).filter(Boolean));
  }
  
  // From file (one per line)
  if (file) {
    if (!existsSync(file)) {
      logger.error(`File not found: ${file}`);
      process.exit(1);
    }
    const lines = readFileSync(file, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
    addresses.push(...lines);
  }
  
  if (!addresses.length) {
    logger.error('No addresses provided');
    logger.info('Usage: web3-wallet validate <address>');
    logger.info('       web3-wallet validate --file addresses.txt');
    logger.info('       web3-wallet validate --batch "0x...,5ey...,bc1..."');
    process.exit(1);
  }
  
  console.log('');
  logger.info(`Validating ${chalk.hex('#06B6D4').bold(formatNumber(addresses.length))} address(es)...`);
  console.log('');
  
  let valid = 0;
  let invalid = 0;
  const chainCounts = {};
  
  for (const addr of addresses) {
    const chain = detectChain(addr);
    const truncated = addr.length > 42 ? addr.slice(0, 20) + '...' + addr.slice(-10) : addr;
    
    if (chain) {
      valid++;
      chainCounts[chain] = (chainCounts[chain] || 0) + 1;
      console.log(`  ${chalk.green('✓')} ${chalk.dim(truncated)}  ${chalk.hex('#3B82F6').bold(chain.toUpperCase())}`);
    } else {
      invalid++;
      console.log(`  ${chalk.red('✗')} ${chalk.dim(truncated)}  ${chalk.red('INVALID')}`);
    }
  }
  
  // Summary
  console.log('');
  renderSummary({
    'Total': formatNumber(addresses.length),
    'Valid': chalk.green(formatNumber(valid)),
    'Invalid': chalk.red(formatNumber(invalid)),
    'Chains Found': Object.entries(chainCounts).map(([c, n]) => `${c.toUpperCase()}(${n})`).join(', ') || 'None',
  });
}
