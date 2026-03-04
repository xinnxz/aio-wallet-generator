/**
 * convert.js — CLI Convert Command
 * 
 * PENJELASAN:
 * ==========
 * Command untuk convert format alamat crypto.
 * Misal: lowercase to checksum (EVM), base58 info, dsb.
 * 
 * Contoh penggunaan:
 * $ web3-wallet convert 0x742d35cc6634c0532925a3b844bc9e7595f2bd28 --to checksum
 * $ web3-wallet convert 0x742d35cc6634c0532925a3b844bc9e7595f2bd28 --to hex
 */

import chalk from 'chalk';
import { ethers } from 'ethers';
import logger from '../../utils/logger.js';

/**
 * Handler untuk command `convert`
 */
export async function handleConvert(args, options) {
  const { to } = options;
  const address = args[0];
  
  if (!address) {
    logger.error('No address provided');
    logger.info('Usage: web3-wallet convert <address> --to <format>');
    logger.info('Formats: checksum, lowercase, uppercase, hex');
    process.exit(1);
  }
  
  console.log('');
  logger.info(`Input: ${chalk.dim(address)}`);
  console.log('');
  
  // EVM address conversions
  if (/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    const lower = address.toLowerCase();
    let checksum;
    try {
      checksum = ethers.getAddress(lower);
    } catch {
      checksum = 'N/A (invalid)';
    }
    
    switch (to?.toLowerCase()) {
      case 'checksum':
        console.log(`  ${chalk.green('→')} ${chalk.bold(checksum)}`);
        break;
      case 'lowercase':
      case 'lower':
        console.log(`  ${chalk.green('→')} ${chalk.bold(lower)}`);
        break;
      case 'uppercase':
      case 'upper':
        console.log(`  ${chalk.green('→')} ${chalk.bold(address.toUpperCase())}`);
        break;
      case 'hex':
        console.log(`  ${chalk.green('→')} ${chalk.bold(lower.slice(2))}`);
        break;
      default:
        // Show all formats
        console.log(`  ${chalk.hex('#3B82F6')('Checksum')}   ${checksum}`);
        console.log(`  ${chalk.hex('#3B82F6')('Lowercase')}  ${lower}`);
        console.log(`  ${chalk.hex('#3B82F6')('Uppercase')}  ${address.toUpperCase()}`);
        console.log(`  ${chalk.hex('#3B82F6')('Raw hex')}    ${lower.slice(2)}`);
        console.log(`  ${chalk.hex('#3B82F6')('Bytes')}      ${lower.slice(2).length / 2} bytes (160-bit)`);
        break;
    }
  } else {
    // Non-EVM: show basic info
    console.log(`  ${chalk.hex('#3B82F6')('Length')}     ${address.length} characters`);
    console.log(`  ${chalk.hex('#3B82F6')('Lowercase')}  ${address.toLowerCase()}`);
    console.log(`  ${chalk.hex('#3B82F6')('Uppercase')}  ${address.toUpperCase()}`);
    
    // Base58 detection
    if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      console.log(`  ${chalk.hex('#3B82F6')('Encoding')}   Base58`);
    } else if (/^[A-Za-z0-9+/=]+$/.test(address)) {
      console.log(`  ${chalk.hex('#3B82F6')('Encoding')}   Base64`);
    }
  }
  
  console.log('');
}
