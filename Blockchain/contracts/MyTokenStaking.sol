// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract StakingRewards is Ownable {
    IERC20 public token;
    
    uint256 public rewardRate = 1000; // 10% APY
    uint256 public minStakeAmount = 100 * 10 ** 18; // 100 tokens
    uint256 public stakingPeriod = 30 days;
    uint256 public earlyUnstakePenalty = 500; // 5%

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 rewards;
        bool isActive;
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public rewardsPool;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 penalty);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsPoolFunded(uint256 amount);

    constructor(address _token) {
        require(_token != address(0), "Invalid token");
        token = IERC20(_token);
    }

    function stake(uint256 amount) external {
        require(amount >= minStakeAmount, "Below minimum");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (stakes[msg.sender].isActive && stakes[msg.sender].amount > 0) {
            _claimRewards();
        }

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        stakes[msg.sender].isActive = true;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        require(stakes[msg.sender].isActive, "No active stake");
        require(stakes[msg.sender].amount > 0, "No tokens");

        uint256 stakedAmount = stakes[msg.sender].amount;
        uint256 penalty = 0;

        if (block.timestamp < stakes[msg.sender].startTime + stakingPeriod) {
            penalty = (stakedAmount * earlyUnstakePenalty) / 10000;
        }

        _claimRewards();

        uint256 toReturn = stakedAmount - penalty;
        stakes[msg.sender].amount = 0;
        stakes[msg.sender].isActive = false;
        totalStaked -= stakedAmount;

        require(token.transfer(msg.sender, toReturn), "Transfer failed");

        if (penalty > 0) {
            rewardsPool += penalty;
        }

        emit Unstaked(msg.sender, stakedAmount, penalty);
    }

    function getPendingRewards(address user) public view returns (uint256) {
        if (!stakes[user].isActive || stakes[user].amount == 0) {
            return stakes[user].rewards;
        }

        uint256 timeStaked = block.timestamp - stakes[user].lastClaimTime;
        uint256 reward = (stakes[user].amount * rewardRate * timeStaked) / (10000 * 365 days);
        return stakes[user].rewards + reward;
    }

    function claimRewards() external {
        _claimRewards();
    }

    function _claimRewards() internal {
        require(stakes[msg.sender].isActive, "No active stake");

        uint256 pending = getPendingRewards(msg.sender);
        if (pending == 0) return;
        
        require(rewardsPool >= pending, "Insufficient pool");

        stakes[msg.sender].rewards = 0;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        rewardsPool -= pending;

        require(token.transfer(msg.sender, pending), "Transfer failed");
        emit RewardsClaimed(msg.sender, pending);
    }

    function fundRewardsPool(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        rewardsPool += amount;
        emit RewardsPoolFunded(amount);
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate <= 10000, "Invalid rate");
        rewardRate = newRate;
    }

    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 pendingRewards,
        bool isActive
    ) {
        return (
            stakes[user].amount,
            stakes[user].startTime,
            getPendingRewards(user),
            stakes[user].isActive
        );
    }
}
