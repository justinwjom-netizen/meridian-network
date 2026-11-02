// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title MockHSKSwap
 * @notice Simulates HSKSwap decentralized exchange router and liquidity pools
 */
contract MockHSKSwap {
    // Exchange rates: tokenIn => tokenOut => rate (scaled by 1e18)
    mapping(address => mapping(address => uint256)) public exchangeRates;
    mapping(address => uint256) public poolReserves;

    event Swapped(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor() {}

    function setRate(address tokenIn, address tokenOut, uint256 rateScaled18) external {
        exchangeRates[tokenIn][tokenOut] = rateScaled18;
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts) {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i = 0; i < path.length - 1; i++) {
            address tIn = path[i];
            address tOut = path[i + 1];
            uint256 rate = exchangeRates[tIn][tOut];
            if (rate == 0) {
                rate = 1e18; // 1:1 default fallback
            }
            amounts[i + 1] = (amounts[i] * rate) / 1e18;
        }
        return amounts;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(block.timestamp <= deadline, "HSKSwap: EXPIRED");
        require(path.length >= 2, "HSKSwap: INVALID_PATH");

        address tokenIn = path[0];
        address tokenOut = path[path.length - 1];

        // Transfer tokenIn from sender
        bool inOk = IERC20Token(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        require(inOk, "HSKSwap: TRANSFER_IN_FAILED");

        uint256 rate = exchangeRates[tokenIn][tokenOut];
        if (rate == 0) {
            rate = 1e18;
        }

        uint256 amountOut = (amountIn * rate) / 1e18;
        require(amountOut >= amountOutMin, "HSKSwap: INSUFFICIENT_OUTPUT_AMOUNT");

        // Mint/transfer tokenOut to recipient
        bool outOk = IERC20Token(tokenOut).transfer(to, amountOut);
        require(outOk, "HSKSwap: TRANSFER_OUT_FAILED");

        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountOut;

        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        return amounts;
    }
}
