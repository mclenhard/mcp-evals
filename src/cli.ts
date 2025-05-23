#!/usr/bin/env node
import { runAllEvals } from './index.js';
import * as dotenv from 'dotenv';
import { EvalConfig } from './types.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Load .env file
dotenv.config();

// Register tsx as a loader
const require = createRequire(import.meta.url);
require('tsx');

async function main() {
  const userEvalsPath = process.argv[2];
  const userServerPath = process.argv[3];
  
  if (!userEvalsPath) {
    console.error('Please provide a path to your evals file');
    console.error('Usage: npx mcp-eval <evals-path> <server-path>');
    process.exit(1);
  }
  if (!userServerPath) {
    console.error('Please provide a path to your server file');
    console.error('Usage: npx mcp-eval <evals-path> <server-path>');
    process.exit(1);
  }

  const absoluteEvalsPath = path.resolve(process.cwd(), userEvalsPath);
  const absoluteServerPath = path.resolve(process.cwd(), userServerPath);
  
  console.log('Running evals file:', absoluteEvalsPath);
  console.log('Using server file:', absoluteServerPath);

  try {
    // Import the TypeScript file 
    const module = await import(absoluteEvalsPath);
    const config: EvalConfig = module.default;

    if (!config || !config.evals) {
      console.error('Invalid config: must export a default config with evals array');
      process.exit(1);
    }

    console.log('Running all evaluations...\n');
    const results = await runAllEvals(config, absoluteServerPath);
    
    console.log('\nEvaluation Results:');
    for (const [name, result] of results.entries()) {
      console.log(`\n${name}:`);
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error running evaluations:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error running evaluations:', error);
  process.exit(1);
}); 