// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockERC20
 * @notice Standard ERC20 token for USDT, USDC, and WHSK on HSK Chain
 */
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(msg.sender, 100_000_000 * (10 ** uint256(_decimals)));
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "ERC20: balance too low");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[sender] >= amount, "ERC20: balance too low");
        require(allowance[sender][msg.sender] >= amount, "ERC20: allowance too low");
        
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        if (allowance[sender][msg.sender] != type(uint256).max) {
            allowance[sender][msg.sender] -= amount;
        }
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function _mint(address account, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[account] += amount;
        emit Transfer(address(0), account, amount);
    }
}
