// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens
    mapping(address => bool) public blacklisted;

    event BlacklistUpdated(address indexed account, bool isBlacklisted);

    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        require(initialSupply <= 1_000_000_000, "Supply too large");
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply * 10 ** 18);
        }
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Invalid address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function addToBlacklist(address account) public onlyOwner {
        require(account != address(0), "Invalid address");
        blacklisted[account] = true;
        emit BlacklistUpdated(account, true);
    }

    function removeFromBlacklist(address account) public onlyOwner {
        blacklisted[account] = false;
        emit BlacklistUpdated(account, false);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) 
        internal 
        override 
    {
        require(!blacklisted[from], "Sender blacklisted");
        require(!blacklisted[to], "Recipient blacklisted");
        super._beforeTokenTransfer(from, to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
