/**
 * info.js — CLI Info Command
 * 
 * PENJELASAN:
 * ==========
 * Command untuk menampilkan informasi tentang semua chain yang didukung.
 * Berguna untuk melihat detail setiap chain: nama, curve, format address, dll.
 * 
 * Contoh:
 * $ web3-wallet info
 * $ web3-wallet info --chain evm
 */

import chalk from 'chalk';
import { getAllChainInfo, getChainInfo, getSupportedChains } from '../../core/generator.js';
import { EVM_CHAINS, NON_EVM_CHAINS } from '../../utils/config.js';
import { renderChainInfo } from '../ui.js';
import Table from 'cli-table3';
import logger from '../../utils/logger.js';

/**
 * Handler untuk command `info`
 */
export async function handleInfo(options = {}) {
  const { chain } = options;

  if (chain) {
    // Show info untuk specific chain
    showChainDetail(chain);
  } else {
    // Show semua chains
    showAllChains();
  }
}

/**
 * Tampilkan info semua chains
 */
function showAllChains() {
  console.log(chalk.hex('#8B5CF6').bold('\n  🌐 Supported Chains Overview\n'));

  // EVM Chains
  console.log(chalk.hex('#06B6D4').bold('  ═══ EVM-Compatible Chains (1 wallet = all networks) ═══\n'));

  const evmTable = new Table({
    head: [
      chalk.bold('#'),
      chalk.bold('Network'),
      chalk.bold('Symbol'),
      chalk.bold('Chain ID'),
      chalk.bold('Explorer'),
    ],
    style: { head: [], border: [] },
    colWidths: [5, 20, 10, 15, 45],
  });

  EVM_CHAINS.forEach((chain, i) => {
    evmTable.push([
      chalk.gray(i + 1),
      chalk.hex('#06B6D4')(chain.name),
      chalk.white(chain.symbol),
      chalk.gray(chain.chainId),
      chalk.gray(chain.explorer),
    ]);
  });

  console.log(evmTable.toString());
  console.log(chalk.gray(`\n  Total: ${EVM_CHAINS.length} EVM networks\n`));

  // Non-EVM Chains
  console.log(chalk.hex('#A78BFA').bold('  ═══ Non-EVM Chains (separate handlers) ═══\n'));

  const chainInfos = getAllChainInfo();
  const nonEvmChains = {};
  for (const key of Object.keys(NON_EVM_CHAINS)) {
    nonEvmChains[key] = chainInfos[key];
  }
  renderChainInfo(nonEvmChains);

  // Summary
  const totalChains = EVM_CHAINS.length + Object.keys(NON_EVM_CHAINS).length;
  console.log(chalk.hex('#10B981').bold(`\n  ✅ Total: ${totalChains} supported chains\n`));
}

/**
 * Tampilkan detail untuk 1 chain
 */
function showChainDetail(chainName) {
  try {
    const info = getChainInfo(chainName.toLowerCase());
    
    console.log(chalk.hex('#8B5CF6').bold(`\n  📋 ${info.name || chainName} Details\n`));

    const details = {
      'Name': info.fullName || info.name || chainName,
      'Curve': info.curve || 'N/A',
      'Address Format': info.addressFormat || 'N/A',
    };

    const table = new Table({
      style: { head: [], border: [] },
    });

    for (const [key, value] of Object.entries(details)) {
      table.push([chalk.hex('#8B5CF6')(key), chalk.white(value)]);
    }
    console.log(table.toString());

    // Features
    if (info.features && info.features.length > 0) {
      console.log(chalk.hex('#06B6D4').bold('\n  Features:'));
      info.features.forEach(f => {
        console.log(chalk.gray(`    • ${f}`));
      });
    }

    // Cosmos: show supported prefixes
    if (chainName.toLowerCase() === 'cosmos' && info.supportedChains) {
      console.log(chalk.hex('#F59E0B').bold('\n  IBC Chain Prefixes:'));
      info.supportedChains.forEach(c => {
        console.log(chalk.gray(`    ${c.prefix}1... → ${c.name}`));
      });
    }

    // EVM: show all networks
    if (chainName.toLowerCase() === 'evm' && info.networks) {
      console.log(chalk.hex('#06B6D4').bold(`\n  Compatible Networks (${info.networks.length}):`));
      info.networks.forEach(n => {
        console.log(chalk.gray(`    • ${n.name} (${n.symbol}) — Chain ID: ${n.chainId}`));
      });
    }

    console.log('');
  } catch (error) {
    logger.error(error.message);
    logger.info(`Supported chains: ${getSupportedChains().join(', ')}`);
  }
}
