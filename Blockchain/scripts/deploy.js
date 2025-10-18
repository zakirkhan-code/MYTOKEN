// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  // ========================================
  // 1. Deploy MyToken
  // ========================================
  console.log("📝 Deploying MyToken...");
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(1000000);
  await myToken.waitForDeployment();

  const tokenAddress = await myToken.getAddress();
  console.log("✅ MyToken deployed to:", tokenAddress);
  console.log("   Initial supply: 1,000,000 tokens\n");

  // ========================================
  // 2. Deploy StakingRewards
  // ========================================
  console.log("📝 Deploying StakingRewards...");
  const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
  const stakingRewards = await StakingRewards.deploy(tokenAddress);
  await stakingRewards.waitForDeployment();

  const stakingAddress = await stakingRewards.getAddress();
  console.log("✅ StakingRewards deployed to:", stakingAddress);
  console.log("   Staking period: 30 days");
  console.log("   Reward rate: 10% APY");
  console.log("   Early penalty: 5%\n");

  // ========================================
  // 3. Fund Rewards Pool
  // ========================================
  console.log("💧 Funding rewards pool...");
  const rewardAmount = ethers.parseEther("100000");
  
  const approveTx = await myToken.approve(stakingAddress, rewardAmount);
  await approveTx.wait();
  console.log("✅ Approved 100,000 tokens for staking contract");

  const fundTx = await stakingRewards.fundRewardsPool(rewardAmount);
  await fundTx.wait();
  console.log("✅ Rewards pool funded with 100,000 tokens\n");

  // ========================================
  // 4. Display Summary
  // ========================================
  console.log("=".repeat(50));
  console.log("✨ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📋 Contract Addresses:");
  console.log("   MyToken:       ", tokenAddress);
  console.log("   StakingRewards:", stakingAddress);
  console.log("\n🌐 Network:", hre.network.name);
  console.log("📄 Deployer:", deployer.address);

  // ========================================
  // 5. Verification Instructions
  // ========================================
  if (hre.network.name === "sepolia") {
    console.log("\n" + "=".repeat(50));
    console.log("🔍 Verify on Etherscan:");
    console.log("=".repeat(50));
    console.log("\nMyToken:");
    console.log(`npx hardhat verify --network sepolia ${tokenAddress} 1000000`);
    console.log("\nStakingRewards:");
    console.log(`npx hardhat verify --network sepolia ${stakingAddress} ${tokenAddress}`);
  }

  console.log("\n✅ All done! Happy staking! 🎉\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });